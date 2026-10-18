package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

// ThesisHandler exposes thesis CRUD and workflow endpoints.
type ThesisHandler struct {
	svc *service.ThesisService
}

// NewThesisHandler creates a ThesisHandler backed by the given service.
func NewThesisHandler(svc *service.ThesisService) *ThesisHandler {
	return &ThesisHandler{svc: svc}
}

// Create creates a new thesis in DRAFT status.
//
//	POST /api/theses
func (h *ThesisHandler) Create(c *gin.Context) {
	var body service.CreateThesisParams
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	thesis, err := h.svc.CreateThesis(c.Request.Context(), body)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusCreated, thesis)
}

// Get returns a single thesis with its members and advisors.
//
//	GET /api/theses/:id
func (h *ThesisHandler) Get(c *gin.Context) {
	thesis, err := h.svc.GetThesis(c.Request.Context(), c.Param("id"))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, thesis)
}

// List returns a filtered, paginated list of theses.
//
//	GET /api/theses?status=DRAFT&limit=50&offset=0
func (h *ThesisHandler) List(c *gin.Context) {
	status := c.Query("status")
	limit := utils.QueryInt(c, "limit", 50)
	offset := utils.QueryInt(c, "offset", 0)

	theses, err := h.svc.ListTheses(c.Request.Context(), status, int32(limit), int32(offset))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": theses})
}

// ListMine returns theses belonging to the authenticated user.
//
//	GET /api/theses/mine
func (h *ThesisHandler) ListMine(c *gin.Context) {
	profileID := middleware.GetUserID(c)

	theses, err := h.svc.ListMyTheses(c.Request.Context(), profileID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": theses})
}

// Update updates the thesis title and abstract fields.
//
//	PUT /api/theses/:id
func (h *ThesisHandler) Update(c *gin.Context) {
	var body service.UpdateTopicsParams
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	thesis, err := h.svc.UpdateTopics(c.Request.Context(), c.Param("id"), body)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, thesis)
}

// Submit transitions the thesis from DRAFT → PROPOSED.
//
//	POST /api/theses/:id/submit
func (h *ThesisHandler) Submit(c *gin.Context) {
	h.transitionTo(c, "PROPOSED")
}

// Review is a generic status transition endpoint that reads the target status
// from the request body.
//
//	POST /api/theses/:id/review
func (h *ThesisHandler) Review(c *gin.Context) {
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("status is required."))
		return
	}
	h.transitionTo(c, body.Status)
}

// Approve transitions the thesis to TOPIC_APPROVED.
//
//	POST /api/theses/:id/approve
func (h *ThesisHandler) Approve(c *gin.Context) {
	h.transitionTo(c, "TOPIC_APPROVED")
}

// Revision transitions the thesis back to DRAFT (for revision).
//
//	POST /api/theses/:id/revision
func (h *ThesisHandler) Revision(c *gin.Context) {
	h.transitionTo(c, "DRAFT")
}

// CountByStatus returns thesis counts grouped by status (for dashboards).
//
//	GET /api/theses/counts
func (h *ThesisHandler) CountByStatus(c *gin.Context) {
	counts, err := h.svc.CountByStatus(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": counts})
}

// AddMember adds a student to the thesis group.
//
//	POST /api/theses/:id/members  { "student_id": "...", "is_leader": false }
func (h *ThesisHandler) AddMember(c *gin.Context) {
	var body struct {
		StudentID string `json:"student_id" binding:"required"`
		IsLeader  bool   `json:"is_leader"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("student_id is required."))
		return
	}

	if err := h.svc.AddMember(c.Request.Context(), c.Param("id"), body.StudentID, body.IsLeader); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member added."})
}

// RemoveMember removes a student from the thesis group.
//
//	DELETE /api/theses/:id/members/:studentId
func (h *ThesisHandler) RemoveMember(c *gin.Context) {
	if err := h.svc.RemoveMember(c.Request.Context(), c.Param("id"), c.Param("studentId")); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed."})
}

// AssignAdvisor assigns a teacher as advisor.
//
//	POST /api/theses/:id/advisors  { "teacher_id": "...", "is_primary": true }
func (h *ThesisHandler) AssignAdvisor(c *gin.Context) {
	var body struct {
		TeacherID string `json:"teacher_id" binding:"required"`
		IsPrimary bool   `json:"is_primary"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("teacher_id is required."))
		return
	}

	if err := h.svc.AssignAdvisor(c.Request.Context(), c.Param("id"), body.TeacherID, body.IsPrimary); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Advisor assigned."})
}

// RemoveAdvisor removes a teacher from the thesis advisor list.
//
//	DELETE /api/theses/:id/advisors/:teacherId
func (h *ThesisHandler) RemoveAdvisor(c *gin.Context) {
	if err := h.svc.RemoveAdvisor(c.Request.Context(), c.Param("id"), c.Param("teacherId")); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Advisor removed."})
}

// transitionTo is a helper that transitions a thesis to the given status.
func (h *ThesisHandler) transitionTo(c *gin.Context, targetStatus string) {
	actorID := middleware.GetUserID(c)

	thesis, err := h.svc.TransitionStatus(c.Request.Context(), c.Param("id"), targetStatus, actorID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, thesis)
}

// ListCategories returns all official thesis categories with caps.
//
//	GET /api/theses/categories
func (h *ThesisHandler) ListCategories(c *gin.Context) {
	categories, err := h.svc.ListCategories(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// ListStages returns the official 18 academic stages.
//
//	GET /api/theses/stages
func (h *ThesisHandler) ListStages(c *gin.Context) {
	stages, err := h.svc.ListAcademicStages(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stages})
}
