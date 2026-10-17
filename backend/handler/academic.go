package handler

import (
	"net/http"

	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type AcademicHandler struct {
	svc *service.AcademicService
}

func NewAcademicHandler(svc *service.AcademicService) *AcademicHandler {
	return &AcademicHandler{svc: svc}
}

// ---------------------------------------------------------------------------
// Student Endpoints
// ---------------------------------------------------------------------------

// ListStudents returns all students with their assigned thesis and advisor details.
//
//	GET /api/students
func (h *AcademicHandler) ListStudents(c *gin.Context) {
	students, err := h.svc.ListStudents(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": students})
}

// GetStudent returns a single student by ID.
//
//	GET /api/students/:id
func (h *AcademicHandler) GetStudent(c *gin.Context) {
	id := c.Param("id")
	student, err := h.svc.GetStudent(c.Request.Context(), id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, student)
}

type CreateStudentRequest struct {
	ProfileID   string `json:"profile_id" binding:"required"`
	StudentCode string `json:"student_code" binding:"required"`
	Department  string `json:"department"`
	Faculty     string `json:"faculty"`
}

// CreateStudent registers a new student record for an existing profile.
//
//	POST /api/students
func (h *AcademicHandler) CreateStudent(c *gin.Context) {
	var body CreateStudentRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("profile_id and student_code are required."))
		return
	}

	student, err := h.svc.CreateStudent(c.Request.Context(), body.ProfileID, body.StudentCode, body.Department, body.Faculty)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, student)
}

type UpdateStudentRequest struct {
	StudentCode string `json:"student_code" binding:"required"`
	Department  string `json:"department"`
	Faculty     string `json:"faculty"`
}

// UpdateStudent updates student code, department, and faculty.
//
//	PUT /api/students/:id
func (h *AcademicHandler) UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var body UpdateStudentRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("student_code is required."))
		return
	}

	student, err := h.svc.UpdateStudent(c.Request.Context(), id, body.StudentCode, body.Department, body.Faculty)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, student)
}

// ---------------------------------------------------------------------------
// Teacher Endpoints
// ---------------------------------------------------------------------------

// ListTeachers returns all teachers along with advising counts and committee counts.
//
//	GET /api/teachers
func (h *AcademicHandler) ListTeachers(c *gin.Context) {
	teachers, err := h.svc.ListTeachers(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": teachers})
}

// GetTeacher returns a single teacher by ID.
//
//	GET /api/teachers/:id
func (h *AcademicHandler) GetTeacher(c *gin.Context) {
	id := c.Param("id")
	teacher, err := h.svc.GetTeacher(c.Request.Context(), id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, teacher)
}

type CreateTeacherRequest struct {
	ProfileID     string `json:"profile_id" binding:"required"`
	AcademicTitle string `json:"academic_title"`
	Department    string `json:"department"`
	Faculty       string `json:"faculty"`
}

// CreateTeacher registers a teacher record for an existing profile.
//
//	POST /api/teachers
func (h *AcademicHandler) CreateTeacher(c *gin.Context) {
	var body CreateTeacherRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("profile_id is required."))
		return
	}

	teacher, err := h.svc.CreateTeacher(c.Request.Context(), body.ProfileID, body.AcademicTitle, body.Department, body.Faculty)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, teacher)
}

type UpdateTeacherRequest struct {
	AcademicTitle string `json:"academic_title"`
	Department    string `json:"department"`
	Faculty       string `json:"faculty"`
}

// UpdateTeacher updates a teacher's academic title, department, or faculty.
//
//	PUT /api/teachers/:id
func (h *AcademicHandler) UpdateTeacher(c *gin.Context) {
	id := c.Param("id")
	var body UpdateTeacherRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	teacher, err := h.svc.UpdateTeacher(c.Request.Context(), id, body.AcademicTitle, body.Department, body.Faculty)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, teacher)
}

// GetTeacherAdvising returns the list of theses advised by the given teacher.
//
//	GET /api/teachers/:id/advising
func (h *AcademicHandler) GetTeacherAdvising(c *gin.Context) {
	id := c.Param("id")
	advising, err := h.svc.GetTeacherAdvising(c.Request.Context(), id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": advising})
}

// GetTeacherCommittees returns exam committee assignments for the given teacher.
//
//	GET /api/teachers/:id/committees
func (h *AcademicHandler) GetTeacherCommittees(c *gin.Context) {
	id := c.Param("id")
	committees, err := h.svc.GetTeacherCommittees(c.Request.Context(), id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": committees})
}
