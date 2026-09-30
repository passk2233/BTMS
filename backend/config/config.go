package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config is deliberately limited to values the API foundation currently uses.
// Authentication configuration will be added after the Supabase signing-key mode
// (JWKS or legacy HS256) has been chosen.
type Config struct {
	Environment        string
	Port               string
	LogLevel           string
	CORSAllowedOrigins []string
	ShutdownTimeout    time.Duration
	ReadHeaderTimeout  time.Duration
	HealthCheckTimeout time.Duration
	Database           DatabaseConfig
}

type DatabaseConfig struct {
	URL            string
	MaxConns       int32
	MinConns       int32
	SimpleProtocol bool
	ConnectTimeout time.Duration
}

func Load() (Config, error) {
	environment := strings.ToLower(strings.TrimSpace(envOrDefault("APP_ENV", "development")))
	port, err := envPort("PORT", "8080")
	if err != nil {
		return Config{}, err
	}

	maxConns, err := envInt32("DATABASE_MAX_CONNS", 10)
	if err != nil {
		return Config{}, err
	}
	minConns, err := envInt32("DATABASE_MIN_CONNS", 2)
	if err != nil {
		return Config{}, err
	}
	simpleProtocol, err := envBool("DATABASE_SIMPLE_PROTOCOL", false)
	if err != nil {
		return Config{}, err
	}
	connectTimeout, err := envDuration("DATABASE_CONNECT_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, err
	}
	healthCheckTimeout, err := envDuration("HEALTHCHECK_TIMEOUT", 2*time.Second)
	if err != nil {
		return Config{}, err
	}
	shutdownTimeout, err := envDuration("SHUTDOWN_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, err
	}
	readHeaderTimeout, err := envDuration("READ_HEADER_TIMEOUT", 5*time.Second)
	if err != nil {
		return Config{}, err
	}

	originsRaw, originsSet := os.LookupEnv("CORS_ALLOWED_ORIGINS")
	originsConfigured := originsSet && strings.TrimSpace(originsRaw) != ""
	if !originsConfigured {
		originsRaw = "http://localhost:3000"
	}

	cfg := Config{
		Environment:        environment,
		Port:               port,
		LogLevel:           strings.ToLower(strings.TrimSpace(envOrDefault("LOG_LEVEL", "info"))),
		CORSAllowedOrigins: splitCSV(originsRaw),
		ShutdownTimeout:    shutdownTimeout,
		ReadHeaderTimeout:  readHeaderTimeout,
		HealthCheckTimeout: healthCheckTimeout,
		Database: DatabaseConfig{
			URL:            strings.TrimSpace(os.Getenv("DATABASE_URL")),
			MaxConns:       maxConns,
			MinConns:       minConns,
			SimpleProtocol: simpleProtocol,
			ConnectTimeout: connectTimeout,
		},
	}

	if err := validate(cfg, originsConfigured); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

func validate(cfg Config, originsConfigured bool) error {
	switch cfg.Environment {
	case "development", "staging", "production":
	default:
		return fmt.Errorf("APP_ENV must be development, staging, or production")
	}

	switch cfg.LogLevel {
	case "debug", "info", "warn", "error":
	default:
		return fmt.Errorf("LOG_LEVEL must be debug, info, warn, or error")
	}

	if cfg.Database.URL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	parsedURL, err := url.Parse(cfg.Database.URL)
	if err != nil || parsedURL.Host == "" || (parsedURL.Scheme != "postgres" && parsedURL.Scheme != "postgresql") {
		return fmt.Errorf("DATABASE_URL must be a postgres:// or postgresql:// URL")
	}
	if cfg.Database.MinConns < 0 || cfg.Database.MaxConns < 1 || cfg.Database.MinConns > cfg.Database.MaxConns {
		return fmt.Errorf("DATABASE_MIN_CONNS must be non-negative and no greater than DATABASE_MAX_CONNS")
	}
	if cfg.Database.ConnectTimeout <= 0 || cfg.HealthCheckTimeout <= 0 || cfg.ShutdownTimeout <= 0 || cfg.ReadHeaderTimeout <= 0 {
		return fmt.Errorf("configured durations must be greater than zero")
	}
	if cfg.Environment != "development" && !originsConfigured {
		return fmt.Errorf("CORS_ALLOWED_ORIGINS must be set outside development")
	}

	return validateOrigins(cfg.CORSAllowedOrigins, cfg.Environment)
}

func validateOrigins(origins []string, environment string) error {
	if len(origins) == 0 {
		return fmt.Errorf("CORS_ALLOWED_ORIGINS must contain at least one origin")
	}

	for _, origin := range origins {
		if origin == "*" {
			if len(origins) != 1 {
				return fmt.Errorf("CORS_ALLOWED_ORIGINS cannot mix * with named origins")
			}
			if environment == "production" {
				return fmt.Errorf("CORS_ALLOWED_ORIGINS cannot be * in production")
			}
			continue
		}

		parsed, err := url.ParseRequestURI(origin)
		if err != nil || parsed.Host == "" || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
			return fmt.Errorf("invalid CORS origin %q", origin)
		}
	}

	return nil
}

func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func envPort(key, fallback string) (string, error) {
	value := envOrDefault(key, fallback)
	port, err := strconv.Atoi(value)
	if err != nil || port < 1 || port > 65535 {
		return "", fmt.Errorf("%s must be a valid TCP port", key)
	}
	return strconv.Itoa(port), nil
}

func envInt32(key string, fallback int32) (int32, error) {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", key, err)
	}
	return int32(parsed), nil
}

func envBool(key string, fallback bool) (bool, error) {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return false, fmt.Errorf("%s must be true or false: %w", key, err)
	}
	return parsed, nil
}

func envDuration(key string, fallback time.Duration) (time.Duration, error) {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return 0, fmt.Errorf("%s must be a positive Go duration such as 10s", key)
	}
	return parsed, nil
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		if origin := strings.TrimSpace(part); origin != "" {
			origins = append(origins, origin)
		}
	}
	return origins
}
