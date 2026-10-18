package handler

import (
	"net/http"
	"strconv"

	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	svc *service.ReportService
}

func NewReportHandler(svc *service.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

func (h *ReportHandler) GetDashboardOverview(c *gin.Context) {
	yearStr := c.DefaultQuery("year", "2026")
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		year = 2026
	}

	overview, err := h.svc.GetDashboardOverview(c.Request.Context(), int32(year))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": overview})
}

func (h *ReportHandler) GetReportByName(c *gin.Context) {
	name := c.Param("name")
	yearStr := c.DefaultQuery("year", "2026")
	year, _ := strconv.Atoi(yearStr)

	overview, err := h.svc.GetDashboardOverview(c.Request.Context(), int32(year))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"report": name,
		"data":   overview,
	})
}
