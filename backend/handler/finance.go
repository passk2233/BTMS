package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type FinanceHandler struct {
	svc *service.FinanceService
}

func NewFinanceHandler(svc *service.FinanceService) *FinanceHandler {
	return &FinanceHandler{svc: svc}
}

// ListFeeRates returns active student exam fee rates.
//
//	GET /api/fees
func (h *FinanceHandler) ListFeeRates(c *gin.Context) {
	rates, err := h.svc.ListFeeRates(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rates})
}

// ListCommitteeRates returns committee compensation rates.
//
//	GET /api/fees/committee
func (h *FinanceHandler) ListCommitteeRates(c *gin.Context) {
	rates, err := h.svc.ListCommitteeRates(c.Request.Context())
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rates})
}

// ListPayments returns fee payments, optionally filtered by thesis_id.
//
//	GET /api/payments?thesis_id=...
func (h *FinanceHandler) ListPayments(c *gin.Context) {
	thesisID := c.Query("thesis_id")
	if thesisID == "" {
		c.JSON(http.StatusOK, gin.H{"data": []service.PaymentDetail{}})
		return
	}

	payments, err := h.svc.ListPaymentsByThesis(c.Request.Context(), thesisID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": payments})
}

// CreatePayment records a new fee payment.
//
//	POST /api/payments
func (h *FinanceHandler) CreatePayment(c *gin.Context) {
	var body service.CreatePaymentParams
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("Invalid request body."))
		return
	}

	if body.RecordedBy == "" {
		body.RecordedBy = middleware.GetUserID(c)
	}

	payment, err := h.svc.CreatePayment(c.Request.Context(), body)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, payment)
}

// VerifyPayment marks a payment verified.
//
//	POST /api/payments/:id/verify
func (h *FinanceHandler) VerifyPayment(c *gin.Context) {
	actorID := middleware.GetUserID(c)
	payment, err := h.svc.VerifyPayment(c.Request.Context(), c.Param("id"), actorID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, payment)
}

// GetStaffWagePeriod returns the wage calculation summary.
//
//	GET /api/disbursements/wage-period?year=2026&period=PROPOSAL
func (h *FinanceHandler) GetStaffWagePeriod(c *gin.Context) {
	year := int32(utils.QueryInt(c, "year", 2026))
	period := c.DefaultQuery("period", "PROPOSAL")

	summary, err := h.svc.GetStaffWagePeriod(c.Request.Context(), year, period)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, summary)
}

// ListDisbursements returns payouts by round_id or wage_period_id.
//
//	GET /api/disbursements?round_id=...&wage_period_id=...
func (h *FinanceHandler) ListDisbursements(c *gin.Context) {
	roundID := c.Query("round_id")
	wagePeriodID := c.Query("wage_period_id")

	payouts, err := h.svc.ListPayouts(c.Request.Context(), roundID, wagePeriodID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": payouts})
}

type UpdatePayoutStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// UpdatePayoutStatus updates disbursement payout status.
//
//	PUT /api/disbursements/:id/status
func (h *FinanceHandler) UpdatePayoutStatus(c *gin.Context) {
	var body UpdatePayoutStatusRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.RespondError(c, utils.BadRequest("status is required."))
		return
	}

	actorID := middleware.GetUserID(c)
	payout, err := h.svc.UpdatePayoutStatus(c.Request.Context(), c.Param("id"), body.Status, actorID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, payout)
}
