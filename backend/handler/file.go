package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	svc *service.FileService
}

func NewFileHandler(svc *service.FileService) *FileHandler {
	return &FileHandler{svc: svc}
}

func (h *FileHandler) CreateFile(c *gin.Context) {
	var input service.CreateFileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body for file metadata."))
		return
	}

	actorID := middleware.GetUserID(c)
	file, err := h.svc.CreateFile(c.Request.Context(), actorID, input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": file})
}

func (h *FileHandler) ListFilesByThesis(c *gin.Context) {
	thesisID := c.Param("thesisId")
	files, err := h.svc.ListFilesByThesis(c.Request.Context(), thesisID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": files})
}

func (h *FileHandler) CreateRevision(c *gin.Context) {
	var input service.CreateRevisionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body for thesis revision."))
		return
	}

	actorID := middleware.GetUserID(c)
	rev, err := h.svc.CreateRevision(c.Request.Context(), actorID, input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": rev})
}

func (h *FileHandler) ListRevisionsByThesis(c *gin.Context) {
	thesisID := c.Param("thesisId")
	revs, err := h.svc.ListRevisionsByThesis(c.Request.Context(), thesisID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": revs})
}

type ReviewRevisionRequest struct {
	Status   string `json:"status" binding:"required"`
	Comments string `json:"comments"`
}

func (h *FileHandler) ReviewRevision(c *gin.Context) {
	revID := c.Param("id")
	var req ReviewRevisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, utils.BadRequest("Status is required (APPROVED, REJECTED, UNDER_REVIEW)."))
		return
	}

	actorID := middleware.GetUserID(c)
	rev, err := h.svc.ReviewRevision(c.Request.Context(), actorID, revID, req.Status, req.Comments)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rev})
}
