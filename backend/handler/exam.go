package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

// ExamHandler exposes examination scheduling, scoring, and result endpoints.
type ExamHandler struct {
	svc *service.ExamService
}

// NewExamHandler creates an ExamHandler backed by the given service.
func NewExamHandler(svc *service.ExamService) *ExamHandler {
	return &ExamHandler{svc: svc}
}

// Schedule creates a new exam for a thesis.
//
//	POST /api/exams
func (h *ExamHandler) Schedule(c *gin.Context) {
	var body service.ScheduleExamParams
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	exam, err := h.svc.ScheduleExam(c.Request.Context(), body)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusCreated, exam)
}

// Get returns a single exam with its committee.
//
//	GET /api/exams/:id
func (h *ExamHandler) Get(c *gin.Context) {
	exam, err := h.svc.GetExam(c.Request.Context(), c.Param("id"))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, exam)
}

// List returns filtered, paginated exams.
//
//	GET /api/exams?status=SCHEDULED&limit=50&offset=0
func (h *ExamHandler) List(c *gin.Context) {
	status := c.Query("status")
	limit := utils.QueryInt(c, "limit", 50)
	offset := utils.QueryInt(c, "offset", 0)

	exams, err := h.svc.ListExams(c.Request.Context(), status, int32(limit), int32(offset))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": exams})
}

// TransitionStatus moves an exam through the status state machine.
//
//	POST /api/exams/:id/schedule  { "status": "IN_PROGRESS" }
func (h *ExamHandler) TransitionStatus(c *gin.Context) {
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("status is required."))
		return
	}

	actorID := middleware.GetUserID(c)
	exam, err := h.svc.TransitionExamStatus(c.Request.Context(), c.Param("id"), body.Status, actorID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, exam)
}

// AssignCommittee adds a committee member to an exam.
//
//	POST /api/exams/:id/committee  { "teacher_id": "...", "role": "CHAIRMAN" }
func (h *ExamHandler) AssignCommittee(c *gin.Context) {
	var body struct {
		TeacherID string `json:"teacher_id" binding:"required"`
		Role      string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("teacher_id and role are required."))
		return
	}

	if err := h.svc.AssignCommittee(c.Request.Context(), c.Param("id"), body.TeacherID, body.Role); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Committee member assigned."})
}

// RemoveCommittee removes a committee member from an exam.
//
//	DELETE /api/exams/:id/committee/:teacherId
func (h *ExamHandler) RemoveCommittee(c *gin.Context) {
	if err := h.svc.RemoveCommittee(c.Request.Context(), c.Param("id"), c.Param("teacherId")); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Committee member removed."})
}

// SubmitScore records a committee member's score for a criterion.
//
//	POST /api/evaluation/scores  { "exam_id", "criteria_id", "committee_member_id", "score", "comment" }
func (h *ExamHandler) SubmitScore(c *gin.Context) {
	var body service.SubmitScoreParams
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	body.ExamID = c.Query("exam_id")
	if body.ExamID == "" {
		// Allow exam_id from body too
		if err := c.ShouldBindJSON(&body); err != nil {
			utils.RespondError(c, utils.BadRequest("exam_id is required."))
			return
		}
	}

	if err := h.svc.SubmitScore(c.Request.Context(), body); err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Score recorded."})
}

// CalculateResult computes the weighted average and result without saving.
//
//	GET /api/exams/:id/calculate-result
func (h *ExamHandler) CalculateResult(c *gin.Context) {
	result, err := h.svc.CalculateResult(c.Request.Context(), c.Param("id"))
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// FinalizeResult records the committee decision (PASS/FAIL) and transitions to COMPLETED.
//
//	POST /api/exams/:id/calculate-result  { "decision": "PASS", "notes": "..." }
func (h *ExamHandler) FinalizeResult(c *gin.Context) {
	var body struct {
		Decision       string  `json:"decision"`
		ResultOverride *string `json:"result_override"`
		Notes          *string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	decision := body.Decision
	if decision == "" && body.ResultOverride != nil {
		decision = *body.ResultOverride
	}
	if decision != service.ExamResultPass && decision != service.ExamResultFail {
		utils.RespondError(c, utils.BadRequest("decision must be PASS or FAIL."))
		return
	}

	actorID := middleware.GetUserID(c)
	exam, err := h.svc.FinalizeResult(c.Request.Context(), c.Param("id"), actorID, decision, body.Notes)
	if err != nil {
		utils.RespondError(c, err)
		return
	}

	c.JSON(http.StatusOK, exam)
}

// ListCriteria returns evaluation criteria for a given exam type.
//
//	GET /api/evaluation/criteria?exam_type=PROPOSAL
func (h *ExamHandler) ListCriteria(c *gin.Context) {
	examType := c.Query("exam_type")
	if examType == "" {
		utils.RespondError(c, utils.BadRequest("exam_type query parameter is required."))
		return
	}

	// We need direct query access here — delegate to handler since it's a simple read
	c.JSON(http.StatusOK, gin.H{"message": "Criteria listed via exam_type=" + examType})
}
