package middleware

import (
	"context"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	// ContextKeyUserRoles is the Gin context key for the authenticated user's
	// role codes, populated by RequireRole.
	ContextKeyUserRoles = "user_roles"
)

// RequireRole returns middleware that authorises access based on the user's
// database roles. At least one of the listed roles must be present. The
// middleware queries the database on every request for authoritative data,
// avoiding stale caches after role changes.
//
// JWTAuth must run before RequireRole so that the user ID is available.
func RequireRole(queries *sqlc.Queries, roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(c *gin.Context) {
		userID := GetUserID(c)
		if userID == "" {
			utils.RespondError(c, utils.Unauthorized("Authentication required."))
			return
		}

		userRoles, err := loadUserRoles(c.Request.Context(), queries, userID)
		if err != nil {
			utils.RespondError(c, utils.Internal(err))
			return
		}

		// Store roles in context for downstream handlers.
		c.Set(ContextKeyUserRoles, userRoles)

		for _, ur := range userRoles {
			if _, ok := allowed[ur]; ok {
				c.Next()
				return
			}
		}

		utils.RespondError(c, utils.Forbidden("You do not have permission to access this resource."))
	}
}

// RequireAnyRole is a readable alias for RequireRole.
func RequireAnyRole(queries *sqlc.Queries, roles ...string) gin.HandlerFunc {
	return RequireRole(queries, roles...)
}

func loadUserRoles(ctx context.Context, queries *sqlc.Queries, userIDStr string) ([]string, error) {
	var uid pgtype.UUID
	if err := uid.Scan(userIDStr); err != nil {
		return nil, err
	}

	rows, err := queries.GetUserRoles(ctx, uid)
	if err != nil {
		return nil, err
	}

	roles := make([]string, len(rows))
	for i, r := range rows {
		roles[i] = r.RoleCode
	}
	return roles, nil
}

// GetUserRoles returns the user's role codes from the Gin context. Returns nil
// if roles have not been loaded by RequireRole middleware.
func GetUserRoles(c *gin.Context) []string {
	if roles, ok := c.Get(ContextKeyUserRoles); ok {
		if r, ok := roles.([]string); ok {
			return r
		}
	}
	return nil
}
