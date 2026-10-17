package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

// UserHandler exposes user profile and role management endpoints.
type UserHandler struct {
	svc *service.UserService
}

// NewUserHandler creates a UserHandler backed by the given service.
func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// Me returns the authenticated user's profile and assigned roles.
//
//	GET /api/me
func (h *UserHandler) Me(c *gin.Context) {
	userID := middleware.GetUserID(c)
	email := middleware.GetUserEmail(c)

	profile, err := h.svc.GetCurrentUser(c.Request.Context(), userID, email)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, profile)
}

// ListUsers returns a paginated list of all users with their roles.
// Requires the ADMIN role.
//
//	GET /api/users?limit=50&offset=0
func (h *UserHandler) ListUsers(c *gin.Context) {
	limit := utils.QueryInt(c, "limit", 50)
	offset := utils.QueryInt(c, "offset", 0)

	users, err := h.svc.ListUsers(c.Request.Context(), int32(limit), int32(offset))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": users})
}

// AssignRole assigns a role to a user. Requires the ADMIN role.
//
//	POST /api/users/:id/roles  { "role_code": "STUDENT" }
func (h *UserHandler) AssignRole(c *gin.Context) {
	targetID := c.Param("id")
	actorID := middleware.GetUserID(c)

	var body struct {
		RoleCode string `json:"role_code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("role_code is required in the request body."))
		return
	}

	if err := h.svc.AssignRole(c.Request.Context(), targetID, body.RoleCode, actorID); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role assigned."})
}

// RemoveRole revokes a role from a user. Requires the ADMIN role.
//
//	DELETE /api/users/:id/roles/:code
func (h *UserHandler) RemoveRole(c *gin.Context) {
	targetID := c.Param("id")
	roleCode := c.Param("code")

	if err := h.svc.RemoveRole(c.Request.Context(), targetID, roleCode); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role removed."})
}
