package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ---------------------------------------------------------------------------
// Response types — serialised as JSON by the handler layer
// ---------------------------------------------------------------------------

// UserRoleDetail is a single role assignment returned in profile responses.
type UserRoleDetail struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	AssignedAt string `json:"assigned_at"`
}

// UserProfile is the response shape for GET /api/me.
type UserProfile struct {
	ID          string           `json:"id"`
	DisplayName *string          `json:"display_name"`
	Email       string           `json:"email,omitempty"`
	Roles       []UserRoleDetail `json:"roles"`
	CreatedAt   string           `json:"created_at"`
	UpdatedAt   string           `json:"updated_at"`
}

// UserListItem is one row in the paginated GET /api/users response.
type UserListItem struct {
	ID          string   `json:"id"`
	DisplayName *string  `json:"display_name"`
	Roles       []string `json:"roles"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

// UserService contains the business logic for user and role management.
type UserService struct {
	queries *sqlc.Queries
}

// NewUserService creates a UserService backed by the given sqlc queries.
func NewUserService(queries *sqlc.Queries) *UserService {
	return &UserService{queries: queries}
}

// GetCurrentUser returns the profile and roles for the authenticated user.
// The email is sourced from the JWT (not the database) because Supabase Auth
// owns the canonical email value.
func (s *UserService) GetCurrentUser(ctx context.Context, userID, email string) (*UserProfile, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, utils.BadRequest("Invalid user ID format.")
	}

	profile, err := s.queries.GetProfileByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Profile not found.")
		}
		return nil, utils.Internal(err)
	}

	roleRows, err := s.queries.GetUserRoles(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	roles := make([]UserRoleDetail, len(roleRows))
	for i, r := range roleRows {
		roles[i] = UserRoleDetail{
			Code:       r.RoleCode,
			Name:       r.RoleName,
			AssignedAt: formatTimestamp(r.AssignedAt),
		}
	}

	return &UserProfile{
		ID:          formatUUID(profile.ID),
		DisplayName: textToPtr(profile.DisplayName),
		Email:       email,
		Roles:       roles,
		CreatedAt:   formatTimestamp(profile.CreatedAt),
		UpdatedAt:   formatTimestamp(profile.UpdatedAt),
	}, nil
}

// ListUsers returns a paginated list of all users with their assigned roles.
func (s *UserService) ListUsers(ctx context.Context, limit, offset int32) ([]UserListItem, error) {
	rows, err := s.queries.ListProfilesWithRoles(ctx, sqlc.ListProfilesWithRolesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]UserListItem, len(rows))
	for i, r := range rows {
		items[i] = UserListItem{
			ID:          formatUUID(r.ID),
			DisplayName: textToPtr(r.DisplayName),
			Roles:       r.Roles,
			CreatedAt:   formatTimestamp(r.CreatedAt),
			UpdatedAt:   formatTimestamp(r.UpdatedAt),
		}
	}
	return items, nil
}

// AssignRole grants a role to the target user. The operation is idempotent —
// assigning an already-held role is a no-op.
func (s *UserService) AssignRole(ctx context.Context, targetID, roleCode, actorID string) error {
	tUID, err := parseUUID(targetID)
	if err != nil {
		return utils.BadRequest("Invalid target user ID.")
	}
	aUID, err := parseUUID(actorID)
	if err != nil {
		return utils.BadRequest("Invalid actor user ID.")
	}

	if err := s.validateRoleCode(ctx, roleCode); err != nil {
		return err
	}

	return s.queries.AssignUserRole(ctx, sqlc.AssignUserRoleParams{
		ProfileID:  tUID,
		RoleCode:   roleCode,
		AssignedBy: aUID,
	})
}

// RemoveRole revokes a role from the target user.
func (s *UserService) RemoveRole(ctx context.Context, targetID, roleCode string) error {
	tUID, err := parseUUID(targetID)
	if err != nil {
		return utils.BadRequest("Invalid target user ID.")
	}

	return s.queries.RemoveUserRole(ctx, sqlc.RemoveUserRoleParams{
		ProfileID: tUID,
		RoleCode:  roleCode,
	})
}

// validateRoleCode ensures the role exists in the catalogue.
func (s *UserService) validateRoleCode(ctx context.Context, code string) error {
	roles, err := s.queries.ListRoles(ctx)
	if err != nil {
		return utils.Internal(err)
	}
	for _, r := range roles {
		if r.Code == code {
			return nil
		}
	}
	return utils.BadRequest(fmt.Sprintf("Unknown role code %q.", code))
}

// ---------------------------------------------------------------------------
// pgtype conversion helpers
// ---------------------------------------------------------------------------

func parseUUID(s string) (pgtype.UUID, error) {
	var uid pgtype.UUID
	err := uid.Scan(s)
	return uid, err
}

func formatUUID(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

func formatTimestamp(t pgtype.Timestamptz) string {
	if !t.Valid {
		return ""
	}
	return t.Time.Format(time.RFC3339)
}

func textToPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}
