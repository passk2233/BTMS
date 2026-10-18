package handler

import (
	"net/http"

	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type PrintingHandler struct {
	svc *service.PrintingService
}

func NewPrintingHandler(svc *service.PrintingService) *PrintingHandler {
	return &PrintingHandler{svc: svc}
}

func (h *PrintingHandler) ListOrders(c *gin.Context) {
	orders, err := h.svc.ListOrders(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *PrintingHandler) GetOrder(c *gin.Context) {
	id := c.Param("id")
	order, err := h.svc.GetOrder(c.Request.Context(), id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": order})
}

func (h *PrintingHandler) CalculateCost(c *gin.Context) {
	var req service.CalculateCostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body for cost calculation."))
		return
	}

	result, err := h.svc.CalculateCost(req.Copies, req.TotalPages, req.ColorPages, req.BindingStyle)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": result})
}

func (h *PrintingHandler) CreateOrder(c *gin.Context) {
	var input service.CreatePrintOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body for print order creation."))
		return
	}

	order, err := h.svc.CreateOrder(c.Request.Context(), input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": order})
}

type UpdateStageRequest struct {
	Stage string `json:"stage" binding:"required"`
}

func (h *PrintingHandler) UpdateStage(c *gin.Context) {
	id := c.Param("id")
	var req UpdateStageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, utils.BadRequest("Stage is required."))
		return
	}

	order, err := h.svc.UpdateStage(c.Request.Context(), id, req.Stage)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": order})
}
