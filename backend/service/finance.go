package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type FinanceService struct {
	queries *sqlc.Queries
}

func NewFinanceService(queries *sqlc.Queries) *FinanceService {
	return &FinanceService{queries: queries}
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

type FeeRateItem struct {
	ID            string  `json:"id"`
	FeeTypeCode   string  `json:"fee_type_code"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	EffectiveFrom string  `json:"effective_from"`
}

type CommitteeRateItem struct {
	ID            string  `json:"id"`
	ExamTypeCode  string  `json:"exam_type_code"`
	Role          string  `json:"role"`
	RateKind      string  `json:"rate_kind"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	EffectiveFrom string  `json:"effective_from"`
}

type CreatePaymentParams struct {
	ThesisID     string  `json:"thesis_id" binding:"required"`
	ExamTypeCode string  `json:"exam_type_code" binding:"required"`
	AttemptNo    int32   `json:"attempt_no"`
	FeeTypeCode  string  `json:"fee_type_code" binding:"required"`
	ExamID       *string `json:"exam_id"`
	Amount       float64 `json:"amount" binding:"required"`
	Currency     string  `json:"currency"`
	ReceiptNo    string  `json:"receipt_no"`
	RecordedBy   string  `json:"recorded_by"`
	Notes        string  `json:"notes"`
}

type PaymentDetail struct {
	ID           string   `json:"id"`
	ThesisID     string   `json:"thesis_id"`
	ExamTypeCode string   `json:"exam_type_code"`
	AttemptNo    int32    `json:"attempt_no"`
	FeeTypeCode  string   `json:"fee_type_code"`
	ExamID       *string  `json:"exam_id"`
	Amount       float64  `json:"amount"`
	Currency     string   `json:"currency"`
	Status       string   `json:"status"`
	ReceiptNo    string   `json:"receipt_no"`
	PaidAt       string   `json:"paid_at"`
	RecordedBy   string   `json:"recorded_by"`
	VerifiedBy   *string  `json:"verified_by"`
	VerifiedAt   *string  `json:"verified_at"`
	Notes        string   `json:"notes"`
}

type StaffWagePeriodSummary struct {
	ID             string                  `json:"id"`
	AcademicYear   int32                   `json:"academic_year"`
	Period         string                  `json:"period"`
	Status         string                  `json:"status"`
	GrossFees      float64                 `json:"gross_fees"`
	CommitteeTotal float64                 `json:"committee_total"`
	SnackTotal     float64                 `json:"snack_total"`
	BaseAmount     float64                 `json:"base_amount"`
	Currency       string                  `json:"currency"`
	Assignments    []StaffWageAssignmentDTO `json:"assignments"`
}

type StaffWageAssignmentDTO struct {
	ID        string  `json:"id"`
	ProfileID string  `json:"profile_id"`
	PayeeName string  `json:"payee_name"`
	Duty      string  `json:"duty"`
	Percent   float64 `json:"percent"`
}

type PayoutDetail struct {
	ID               string   `json:"id"`
	PayoutType       string   `json:"payout_type"`
	RoundID          *string  `json:"round_id"`
	ExamID           *string  `json:"exam_id"`
	ExamCommitteeID  *string  `json:"exam_committee_id"`
	TeacherID        *string  `json:"teacher_id"`
	WagePeriodID     *string  `json:"wage_period_id"`
	WageAssignmentID *string  `json:"wage_assignment_id"`
	PayeeName        string   `json:"payee_name"`
	RateAmount       float64  `json:"rate_amount"`
	Percent          float64  `json:"percent"`
	BaseAmount       float64  `json:"base_amount"`
	Amount           float64  `json:"amount"`
	Currency         string   `json:"currency"`
	Status           string   `json:"status"`
	Notes            string   `json:"notes"`
	ApprovedBy       *string  `json:"approved_by"`
	ApprovedAt       *string  `json:"approved_at"`
	PaidAt           *string  `json:"paid_at"`
}

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

func (s *FinanceService) ListFeeRates(ctx context.Context) ([]FeeRateItem, error) {
	rows, err := s.queries.ListActiveFeeRates(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]FeeRateItem, len(rows))
	for i, r := range rows {
		res[i] = FeeRateItem{
			ID:            formatUUID(r.ID),
			FeeTypeCode:   r.FeeTypeCode,
			Amount:        numericToFloat(r.Amount),
			Currency:      r.Currency,
			EffectiveFrom: r.EffectiveFrom.Time.Format("2006-01-02"),
		}
	}
	return res, nil
}

func (s *FinanceService) ListCommitteeRates(ctx context.Context) ([]CommitteeRateItem, error) {
	rows, err := s.queries.ListActiveCommitteeRates(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]CommitteeRateItem, len(rows))
	for i, r := range rows {
		res[i] = CommitteeRateItem{
			ID:            formatUUID(r.ID),
			ExamTypeCode:  r.ExamTypeCode,
			Role:          r.Role,
			RateKind:      r.RateKind,
			Amount:        numericToFloat(r.Amount),
			Currency:      r.Currency,
			EffectiveFrom: r.EffectiveFrom.Time.Format("2006-01-02"),
		}
	}
	return res, nil
}

func (s *FinanceService) CreatePayment(ctx context.Context, p CreatePaymentParams) (*PaymentDetail, error) {
	thesisUUID, err := parseUUID(p.ThesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}

	recUUID, err := parseUUID(p.RecordedBy)
	if err != nil {
		return nil, utils.BadRequest("Invalid recorded_by.")
	}

	var examUUID pgtype.UUID
	if p.ExamID != nil && *p.ExamID != "" {
		examUUID, err = parseUUID(*p.ExamID)
		if err != nil {
			return nil, utils.BadRequest("Invalid exam_id.")
		}
	}

	attemptNo := p.AttemptNo
	if attemptNo <= 0 {
		attemptNo = 1
	}

	currency := p.Currency
	if currency == "" {
		currency = "LAK"
	}

	row, err := s.queries.CreateExamFeePayment(ctx, sqlc.CreateExamFeePaymentParams{
		ThesisID:     thesisUUID,
		ExamTypeCode: p.ExamTypeCode,
		AttemptNo:    attemptNo,
		FeeTypeCode:  p.FeeTypeCode,
		ExamID:       examUUID,
		Amount:       pgNumeric(p.Amount),
		Column7:      currency,
		Column8:      "PAID",
		Column9:      p.ReceiptNo,
		RecordedBy:   recUUID,
		Column11:     p.Notes,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.toPaymentDetail(row), nil
}

func (s *FinanceService) ListPaymentsByThesis(ctx context.Context, thesisID string) ([]PaymentDetail, error) {
	tUUID, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}

	rows, err := s.queries.ListExamFeePaymentsByThesis(ctx, tUUID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]PaymentDetail, len(rows))
	for i, r := range rows {
		res[i] = *s.toPaymentDetail(r)
	}
	return res, nil
}

func (s *FinanceService) VerifyPayment(ctx context.Context, paymentID string, verifiedBy string) (*PaymentDetail, error) {
	pUUID, err := parseUUID(paymentID)
	if err != nil {
		return nil, utils.BadRequest("Invalid payment_id.")
	}

	vUUID, err := parseUUID(verifiedBy)
	if err != nil {
		return nil, utils.BadRequest("Invalid verified_by.")
	}

	row, err := s.queries.VerifyExamFeePayment(ctx, sqlc.VerifyExamFeePaymentParams{
		ID:         pUUID,
		VerifiedBy: vUUID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Payment record not found.")
		}
		return nil, utils.Internal(err)
	}

	return s.toPaymentDetail(row), nil
}

func (s *FinanceService) GetStaffWagePeriod(ctx context.Context, year int32, period string) (*StaffWagePeriodSummary, error) {
	row, err := s.queries.GetStaffWagePeriodByYearAndPeriod(ctx, sqlc.GetStaffWagePeriodByYearAndPeriodParams{
		AcademicYear: year,
		Period:       period,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound(fmt.Sprintf("Staff wage period for %d %s not found.", year, period))
		}
		return nil, utils.Internal(err)
	}

	assignments, err := s.queries.ListStaffWageAssignments(ctx, row.ID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	assignDTOs := make([]StaffWageAssignmentDTO, len(assignments))
	for i, a := range assignments {
		assignDTOs[i] = StaffWageAssignmentDTO{
			ID:        formatUUID(a.ID),
			ProfileID: formatUUID(a.ProfileID),
			PayeeName: a.PayeeName,
			Duty:      a.Duty,
			Percent:   numericToFloat(a.Percent),
		}
	}

	return &StaffWagePeriodSummary{
		ID:             formatUUID(row.ID),
		AcademicYear:   row.AcademicYear,
		Period:         row.Period,
		Status:         row.Status,
		GrossFees:      numericToFloat(row.GrossFees),
		CommitteeTotal: numericToFloat(row.CommitteeTotal),
		SnackTotal:     numericToFloat(row.SnackTotal),
		BaseAmount:     numericToFloat(row.BaseAmount),
		Currency:       row.Currency,
		Assignments:    assignDTOs,
	}, nil
}

func (s *FinanceService) ListPayouts(ctx context.Context, roundID string, wagePeriodID string) ([]PayoutDetail, error) {
	var rows []sqlc.Payout
	var err error

	if roundID != "" {
		rUUID, parseErr := parseUUID(roundID)
		if parseErr != nil {
			return nil, utils.BadRequest("Invalid round_id.")
		}
		rows, err = s.queries.ListPayoutsByRound(ctx, rUUID)
	} else if wagePeriodID != "" {
		wUUID, parseErr := parseUUID(wagePeriodID)
		if parseErr != nil {
			return nil, utils.BadRequest("Invalid wage_period_id.")
		}
		rows, err = s.queries.ListPayoutsByWagePeriod(ctx, wUUID)
	} else {
		return nil, utils.BadRequest("round_id or wage_period_id must be provided.")
	}

	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]PayoutDetail, len(rows))
	for i, r := range rows {
		res[i] = PayoutDetail{
			ID:               formatUUID(r.ID),
			PayoutType:       r.PayoutType,
			RoundID:          uuidToPtr(r.RoundID),
			ExamID:           uuidToPtr(r.ExamID),
			ExamCommitteeID:  uuidToPtr(r.ExamCommitteeID),
			TeacherID:        uuidToPtr(r.TeacherID),
			WagePeriodID:     uuidToPtr(r.WagePeriodID),
			WageAssignmentID: uuidToPtr(r.WageAssignmentID),
			PayeeName:        r.PayeeName,
			RateAmount:       numericToFloat(r.RateAmount),
			Percent:          numericToFloat(r.Percent),
			BaseAmount:       numericToFloat(r.BaseAmount),
			Amount:           numericToFloat(r.Amount),
			Currency:         r.Currency,
			Status:           r.Status,
			Notes:            r.Notes,
			ApprovedBy:       uuidToPtr(r.ApprovedBy),
			ApprovedAt:       pgTimestamptzToPtr(r.ApprovedAt),
			PaidAt:           pgTimestamptzToPtr(r.PaidAt),
		}
	}
	return res, nil
}

func (s *FinanceService) UpdatePayoutStatus(ctx context.Context, payoutID string, status string, actorID string) (*PayoutDetail, error) {
	pUUID, err := parseUUID(payoutID)
	if err != nil {
		return nil, utils.BadRequest("Invalid payout_id.")
	}

	var actorUUID pgtype.UUID
	if actorID != "" {
		actorUUID, err = parseUUID(actorID)
		if err != nil {
			return nil, utils.BadRequest("Invalid actor_id.")
		}
	}

	row, err := s.queries.UpdatePayoutStatus(ctx, sqlc.UpdatePayoutStatusParams{
		ID:         pUUID,
		Status:     status,
		ApprovedBy: actorUUID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Payout not found.")
		}
		return nil, utils.Internal(err)
	}

	return &PayoutDetail{
		ID:               formatUUID(row.ID),
		PayoutType:       row.PayoutType,
		RoundID:          uuidToPtr(row.RoundID),
		ExamID:           uuidToPtr(row.ExamID),
		ExamCommitteeID:  uuidToPtr(row.ExamCommitteeID),
		TeacherID:        uuidToPtr(row.TeacherID),
		WagePeriodID:     uuidToPtr(row.WagePeriodID),
		WageAssignmentID: uuidToPtr(row.WageAssignmentID),
		PayeeName:        row.PayeeName,
		RateAmount:       numericToFloat(row.RateAmount),
		Percent:          numericToFloat(row.Percent),
		BaseAmount:       numericToFloat(row.BaseAmount),
		Amount:           numericToFloat(row.Amount),
		Currency:         row.Currency,
		Status:           row.Status,
		Notes:            row.Notes,
		ApprovedBy:       uuidToPtr(row.ApprovedBy),
		ApprovedAt:       pgTimestamptzToPtr(row.ApprovedAt),
		PaidAt:           pgTimestamptzToPtr(row.PaidAt),
	}, nil
}

func (s *FinanceService) toPaymentDetail(r sqlc.ExamFeePayment) *PaymentDetail {
	return &PaymentDetail{
		ID:           formatUUID(r.ID),
		ThesisID:     formatUUID(r.ThesisID),
		ExamTypeCode: r.ExamTypeCode,
		AttemptNo:    r.AttemptNo,
		FeeTypeCode:  r.FeeTypeCode,
		ExamID:       uuidToPtr(r.ExamID),
		Amount:       numericToFloat(r.Amount),
		Currency:     r.Currency,
		Status:       r.Status,
		ReceiptNo:    r.ReceiptNo,
		PaidAt:       formatTimestamp(r.PaidAt),
		RecordedBy:   formatUUID(r.RecordedBy),
		VerifiedBy:   uuidToPtr(r.VerifiedBy),
		VerifiedAt:   pgTimestamptzToPtr(r.VerifiedAt),
		Notes:        r.Notes,
	}
}
