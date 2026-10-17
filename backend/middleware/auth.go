package middleware

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	// ContextKeyUserID is the Gin context key for the authenticated user's UUID
	// (the JWT "sub" claim).
	ContextKeyUserID = "user_id"

	// ContextKeyUserEmail is the Gin context key for the authenticated user's
	// email (the JWT "email" claim, set by Supabase Auth).
	ContextKeyUserEmail = "user_email"
)

// ---------------------------------------------------------------------------
// JWKS Provider — fetches, caches and serves RSA public keys
// ---------------------------------------------------------------------------

type jwkKey struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type jwksDocument struct {
	Keys []jwkKey `json:"keys"`
}

// JWKSProvider fetches, caches and serves RSA public keys from a remote JWKS
// endpoint for JWT signature verification. Keys are refreshed when the
// configurable cache TTL expires.
type JWKSProvider struct {
	url      string
	cacheTTL time.Duration
	logger   *slog.Logger
	client   *http.Client

	mu        sync.RWMutex
	keys      map[string]*rsa.PublicKey
	fetchedAt time.Time
}

// NewJWKSProvider creates a JWKS provider. It performs an initial fetch so the
// server fails fast when the URL is unreachable or returns no usable keys.
func NewJWKSProvider(jwksURL string, cacheTTL time.Duration, logger *slog.Logger) (*JWKSProvider, error) {
	p := &JWKSProvider{
		url:      jwksURL,
		cacheTTL: cacheTTL,
		logger:   logger,
		client:   &http.Client{Timeout: 10 * time.Second},
		keys:     make(map[string]*rsa.PublicKey),
	}

	if err := p.refresh(); err != nil {
		return nil, fmt.Errorf("initial JWKS fetch from %s: %w", jwksURL, err)
	}

	logger.Info("jwks provider initialised", "url", jwksURL, "keys_loaded", len(p.keys))
	return p, nil
}

// Keyfunc satisfies the jwt.Keyfunc signature. It resolves the signing key for
// the given token by matching the "kid" header against cached JWKS keys,
// refreshing the cache when necessary.
func (p *JWKSProvider) Keyfunc(token *jwt.Token) (interface{}, error) {
	kid, ok := token.Header["kid"].(string)
	if !ok || kid == "" {
		return nil, fmt.Errorf("token header missing kid")
	}

	p.mu.RLock()
	key, found := p.keys[kid]
	expired := time.Since(p.fetchedAt) > p.cacheTTL
	p.mu.RUnlock()

	if found && !expired {
		return key, nil
	}

	// Cache miss or expired — try to refresh from the JWKS endpoint.
	if err := p.refresh(); err != nil {
		p.logger.Warn("jwks refresh failed, using cached keys", "error", err)
		if found {
			return key, nil // stale but usable
		}
		return nil, fmt.Errorf("jwks refresh failed and key %q not in cache: %w", kid, err)
	}

	p.mu.RLock()
	key, found = p.keys[kid]
	p.mu.RUnlock()

	if !found {
		return nil, fmt.Errorf("key %q not found in JWKS", kid)
	}
	return key, nil
}

func (p *JWKSProvider) refresh() error {
	resp, err := p.client.Get(p.url)
	if err != nil {
		return fmt.Errorf("fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS endpoint returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20)) // 1 MiB limit
	if err != nil {
		return fmt.Errorf("read JWKS body: %w", err)
	}

	var doc jwksDocument
	if err := json.Unmarshal(body, &doc); err != nil {
		return fmt.Errorf("parse JWKS JSON: %w", err)
	}

	keys := make(map[string]*rsa.PublicKey, len(doc.Keys))
	for _, k := range doc.Keys {
		if k.Kty != "RSA" || (k.Use != "" && k.Use != "sig") {
			continue
		}
		pub, err := parseRSAPublicKey(k)
		if err != nil {
			p.logger.Warn("skipping unparseable JWKS key", "kid", k.Kid, "error", err)
			continue
		}
		keys[k.Kid] = pub
	}

	if len(keys) == 0 {
		return fmt.Errorf("JWKS contains no usable RSA signing keys")
	}

	p.mu.Lock()
	p.keys = keys
	p.fetchedAt = time.Now()
	p.mu.Unlock()

	return nil
}

func parseRSAPublicKey(k jwkKey) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
	if err != nil {
		return nil, fmt.Errorf("decode modulus: %w", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
	if err != nil {
		return nil, fmt.Errorf("decode exponent: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := int(new(big.Int).SetBytes(eBytes).Int64())

	return &rsa.PublicKey{N: n, E: e}, nil
}

// ---------------------------------------------------------------------------
// JWT Authentication Middleware
// ---------------------------------------------------------------------------

// JWTAuth returns Gin middleware that validates Supabase JWTs using the
// configured JWKS endpoint. On success it stores the user ID (sub) and email
// in the Gin context.
func JWTAuth(provider *JWKSProvider, issuer string, logger *slog.Logger) gin.HandlerFunc {
	parser := jwt.NewParser(
		jwt.WithIssuer(issuer),
		jwt.WithExpirationRequired(),
		jwt.WithValidMethods([]string{"RS256"}),
	)

	return func(c *gin.Context) {
		raw := extractBearerToken(c.GetHeader("Authorization"))
		if raw == "" {
			utils.RespondError(c, utils.Unauthorized("Missing or malformed Authorization header."))
			return
		}

		token, err := parser.Parse(raw, provider.Keyfunc)
		if err != nil {
			logger.Warn("jwt validation failed",
				"error", err,
				"request_id", utils.RequestID(c),
			)
			if errors.Is(err, jwt.ErrTokenExpired) {
				utils.RespondError(c, utils.Unauthorized("Token has expired."))
			} else {
				utils.RespondError(c, utils.Unauthorized("Invalid token."))
			}
			return
		}

		sub, err := token.Claims.GetSubject()
		if err != nil || sub == "" {
			utils.RespondError(c, utils.Unauthorized("Token is missing subject claim."))
			return
		}

		c.Set(ContextKeyUserID, sub)

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if email, ok := claims["email"].(string); ok {
				c.Set(ContextKeyUserEmail, email)
			}
		}

		c.Next()
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func extractBearerToken(header string) string {
	if len(header) > 7 && strings.EqualFold(header[:7], "bearer ") {
		return strings.TrimSpace(header[7:])
	}
	return ""
}

// GetUserID returns the authenticated user's UUID from the Gin context.
// Returns an empty string if the user is not authenticated.
func GetUserID(c *gin.Context) string {
	return c.GetString(ContextKeyUserID)
}

// GetUserEmail returns the authenticated user's email from the Gin context.
func GetUserEmail(c *gin.Context) string {
	return c.GetString(ContextKeyUserEmail)
}
