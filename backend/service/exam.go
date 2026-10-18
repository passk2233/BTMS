package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const (
	ExamStatusScheduled  = "SCHEDULED"
	ExamStatusInProgress = "IN_PROGRESS"
	ExamStatusScoring    = "SCORING"
	ExamStatusCompleted  = "COMPLETED"
	ExamStatusCancelled  = "CANCELLED"

	ExamResultPass = "PASS"
	ExamResultFail = "FAIL"

	// PassThreshold is the minimum weighted average score (out of 100)
	// used for score summary reporting.
	PassThreshold = 60.0
)

var validExamTransitions = map[string][]string{
	ExamStatusScheduled:  {ExamStatusInProgress, ExamStatusCancelled},
	ExamStatusInProgress: {ExamStatusScoring, ExamStatusCancelled},
	ExamStatusScoring:    {ExamStatusCompleted, ExamStatusInProgress},
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

type ExamDetail struct {
	ID            string          `json:"id"`
	ThesisID      string          `json:"thesis_id"`
	ExamTypeCode  string          `json:"exam_type_code"`
	RoomID        *string         `json:"room_id"`
	RoundID       *string         `json:"round_id,omitempty"`
	AttemptNo     int32           `json:"attempt_no"`
	Status        string          `json:"status"`
	ScheduledDate *string         `json:"scheduled_date"`
	StartTime     *string         `json:"start_time"`
	EndTime       *string         `json:"end_time"`
	Notes         string          `json:"notes"`
	Result        *string         `json:"result"`
	ResultNotes   string          `json:"result_notes"`
	DecidedBy     *string         `json:"decided_by,omitempty"`
	DecidedAt     *string         `json:"decided_at,omitempty"`
	CreatedAt     string          `json:"created_at"`
	UpdatedAt     string          `json:"updated_at"`
	Committee     []CommitteeItem `json:"committee,omitempty"`
}

type ExamListItem struct {
	ID            string  `json:"id"`
	ThesisID      string  `json:"thesis_id"`
	ExamTypeCode  string  `json:"exam_type_code"`
	Status        string  `json:"status"`
	ScheduledDate *string `json:"scheduled_date"`
	Result        *string `json:"result"`
	TopicEN       string  `json:"topic_en,omitempty"`
	TopicTH       string  `json:"topic_th,omitempty"`
	UpdatedAt     string  `json:"updated_at"`
}

type CommitteeItem struct {
	ID            string  `json:"id"`
	TeacherID     string  `json:"teacher_id"`
	Role          string  `json:"role"`
	AcademicTitle string  `json:"academic_title"`
	DisplayName   *string `json:"display_name"`
	Department    string  `json:"department"`
}

type ScoreSummaryItem struct {
	CriteriaID   string  `json:"criteria_id"`
	CriteriaName string  `json:"criteria_name"`
	MaxScore     float64 `json:"max_score"`
	Weight       float64 `json:"weight"`
	AvgScore     float64 `json:"avg_score"`
	ScorerCount  int     `json:"scorer_count"`
}

type CalculatedResult struct {
	WeightedAverage float64            `json:"weighted_average"`
	Result          string             `json:"result"`
	Criteria        []ScoreSummaryItem `json:"criteria"`
}

type ExamRoundItem struct {
	ID           string  `json:"id"`
	AcademicYear int32   `json:"academic_year"`
	Period       string  `json:"period"`
	RoundNo      int32   `json:"round_no"`
	Name         string  `json:"name"`
	StartDate    *string `json:"start_date"`
	EndDate      *string `json:"end_date"`
	Status       string  `json:"status"`
	ClosedAt     *string `json:"closed_at,omitempty"`
}

type RoundRoomItem struct {
	RoundID      string `json:"round_id"`
	RoomID       string `json:"room_id"`
	RoomName     string `json:"room_name"`
	Building     string `json:"building"`
	Floor        string `json:"floor"`
	Capacity     int32  `json:"capacity"`
	CategoryCode string `json:"category_code"`
	CategoryName string `json:"category_name"`
}

type CommitteeFeeSummary struct {
	RoundID        string             `json:"round_id"`
	AcademicYear   int32              `json:"academic_year"`
	Period         string             `json:"period"`
	RoundNo        int32              `json:"round_no"`
	ExamCount      int                `json:"exam_count"`
	TotalAmount    float64            `json:"total_amount"`
	Currency       string             `json:"currency"`
	CommitteeItems []CommitteeFeeItem `json:"committee_items"`
}

type CommitteeFeeItem struct {
	ExamID      string  `json:"exam_id"`
	TeacherID   string  `json:"teacher_id"`
	TeacherName string  `json:"teacher_name"`
	Role        string  `json:"role"`
	AttemptNo   int32   `json:"attempt_no"`
	BaseRate    float64 `json:"base_rate"`
	RetakeBonus float64 `json:"retake_bonus"`
	TotalFee    float64 `json:"total_fee"`
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

type ExamService struct {
	queries *sqlc.Queries
}

func NewExamService(queries *sqlc.Queries) *ExamService {
	return &ExamService{queries: queries}
}

// ScheduleExam creates a new exam for a thesis.
func (s *ExamService) ScheduleExam(ctx context.Context, params ScheduleExamParams) (*ExamDetail, error) {
	thesisUID, err := parseUUID(params.ThesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis ID.")
	}

	var roomUID pgtype.UUID
	if params.RoomID != nil && *params.RoomID != "" {
		roomUID, err = parseUUID(*params.RoomID)
		if err != nil {
			return nil, utils.BadRequest("Invalid room ID.")
		}
	}

	var roundUID pgtype.UUID
	if params.RoundID != nil && *params.RoundID != "" {
		roundUID, err = parseUUID(*params.RoundID)
		if err != nil {
			return nil, utils.BadRequest("Invalid round ID.")
		}
	}

	attemptNo := int32(1)
	if params.AttemptNo != nil && *params.AttemptNo > 0 {
		attemptNo = *params.AttemptNo
	} else {
		maxAttempt, err := s.queries.GetLatestExamAttempt(ctx, sqlc.GetLatestExamAttemptParams{
			ThesisID:     thesisUID,
			ExamTypeCode: params.ExamTypeCode,
		})
		if err == nil && maxAttempt > 0 {
			attemptNo = maxAttempt + 1
		}
	}

	exam, err := s.queries.CreateExam(ctx, sqlc.CreateExamParams{
		ThesisID:      thesisUID,
		ExamTypeCode:  params.ExamTypeCode,
		RoomID:        roomUID,
		RoundID:       roundUID,
		AttemptNo:     attemptNo,
		ScheduledDate: dateToPgDate(params.ScheduledDate),
		StartTime:     timeToPgTime(params.StartTime),
		EndTime:       timeToPgTime(params.EndTime),
		Notes:         params.Notes,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.examToDetail(ctx, exam)
}

type ScheduleExamParams struct {
	ThesisID      string  `json:"thesis_id" binding:"required"`
	ExamTypeCode  string  `json:"exam_type_code" binding:"required"`
	RoomID        *string `json:"room_id"`
	RoundID       *string `json:"round_id"`
	AttemptNo     *int32  `json:"attempt_no"`
	ScheduledDate *string `json:"scheduled_date"`
	StartTime     *string `json:"start_time"`
	EndTime       *string `json:"end_time"`
	Notes         string  `json:"notes"`
}

// GetExam returns an exam with its committee.
func (s *ExamService) GetExam(ctx context.Context, examID string) (*ExamDetail, error) {
	uid, err := parseUUID(examID)
	if err != nil {
		return nil, utils.BadRequest("Invalid exam ID.")
	}

	exam, err := s.queries.GetExamByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Exam not found.")
		}
		return nil, utils.Internal(err)
	}

	return s.examToDetail(ctx, exam)
}

// ListExams returns filtered, paginated exams.
func (s *ExamService) ListExams(ctx context.Context, statusFilter string, limit, offset int32) ([]ExamListItem, error) {
	rows, err := s.queries.ListExamsByStatus(ctx, sqlc.ListExamsByStatusParams{
		Column1: statusFilter,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]ExamListItem, len(rows))
	for i, r := range rows {
		items[i] = ExamListItem{
			ID:            formatUUID(r.ID),
			ThesisID:      formatUUID(r.ThesisID),
			ExamTypeCode:  r.ExamTypeCode,
			Status:        r.Status,
			ScheduledDate: pgDateToPtr(r.ScheduledDate),
			Result:        textToPtr(pgtype.Text{String: r.Result.String, Valid: r.Result.Valid}),
			TopicEN:       r.TopicEn,
			TopicTH:       r.TopicTh,
			UpdatedAt:     formatTimestamp(r.UpdatedAt),
		}
	}
	return items, nil
}

// ListExamsByThesis returns all exams for a given thesis.
func (s *ExamService) ListExamsByThesis(ctx context.Context, thesisID string) ([]ExamListItem, error) {
	uid, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis ID.")
	}

	rows, err := s.queries.ListExamsByThesis(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]ExamListItem, len(rows))
	for i, r := range rows {
		items[i] = ExamListItem{
			ID:            formatUUID(r.ID),
			ThesisID:      formatUUID(r.ThesisID),
			ExamTypeCode:  r.ExamTypeCode,
			Status:        r.Status,
			ScheduledDate: pgDateToPtr(r.ScheduledDate),
			Result:        textToPtr(pgtype.Text{String: r.Result.String, Valid: r.Result.Valid}),
			UpdatedAt:     formatTimestamp(r.UpdatedAt),
		}
	}
	return items, nil
}

// TransitionExamStatus moves an exam through the status state machine.
func (s *ExamService) TransitionExamStatus(ctx context.Context, examID, newStatus, actorID string) (*ExamDetail, error) {
	uid, err := parseUUID(examID)
	if err != nil {
		return nil, utils.BadRequest("Invalid exam ID.")
	}

	current, err := s.queries.GetExamByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Exam not found.")
		}
		return nil, utils.Internal(err)
	}

	if !isValidExamTransition(current.Status, newStatus) {
		return nil, utils.BadRequest(fmt.Sprintf(
			"Cannot transition exam from %q to %q.", current.Status, newStatus,
		))
	}

	exam, err := s.queries.UpdateExamStatus(ctx, sqlc.UpdateExamStatusParams{
		ID:     uid,
		Status: newStatus,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	// Audit log
	actorUUID, _ := parseUUID(actorID)
	oldJSON, _ := json.Marshal(map[string]string{"status": current.Status})
	newJSON, _ := json.Marshal(map[string]string{"status": newStatus})
	_ = s.queries.InsertAuditLog(ctx, sqlc.InsertAuditLogParams{
		ActorID:    actorUUID,
		Action:     "exam.status_change",
		EntityType: pgtype.Text{String: "exam", Valid: true},
		EntityID:   pgtype.Text{String: formatUUID(uid), Valid: true},
		OldValues:  oldJSON,
		NewValues:  newJSON,
		Metadata:   []byte("{}"),
	})

	return s.examToDetail(ctx, exam)
}

// AssignCommittee adds or updates a committee member for an exam.
func (s *ExamService) AssignCommittee(ctx context.Context, examID, teacherID, role string) error {
	if role != "CHAIRMAN" && role != "COMMITTEE" {
		return utils.BadRequest("Invalid committee role: must be CHAIRMAN or COMMITTEE.")
	}

	eUID, err := parseUUID(examID)
	if err != nil {
		return utils.BadRequest("Invalid exam ID.")
	}
	tUID, err := parseUUID(teacherID)
	if err != nil {
		return utils.BadRequest("Invalid teacher ID.")
	}

	exam, err := s.queries.GetExamByID(ctx, eUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return utils.NotFound("Exam not found.")
		}
		return utils.Internal(err)
	}

	// Invariant: An advisor cannot serve as a committee member of their own group's exam
	advisors, err := s.queries.ListThesisAdvisors(ctx, exam.ThesisID)
	if err != nil {
		return utils.Internal(err)
	}
	for _, a := range advisors {
		if a.TeacherID == tUID {
			return utils.BadRequest("The thesis advisor is strictly prohibited from being an examination committee member.")
		}
	}

	// Enforce committee rules: max 3 members per exam, at most 1 CHAIRMAN
	currentMembers, err := s.queries.ListExamCommittees(ctx, eUID)
	if err != nil {
		return utils.Internal(err)
	}

	alreadyMember := false
	for _, m := range currentMembers {
		if m.TeacherID == tUID {
			alreadyMember = true
		} else if role == "CHAIRMAN" && m.Role == "CHAIRMAN" {
			return utils.BadRequest("An examination can only have one CHAIRMAN.")
		}
	}
	if !alreadyMember && len(currentMembers) >= 3 {
		return utils.BadRequest("An examination committee cannot exceed 3 members (1 Chairman, 2 Committee).")
	}

	_, err = s.queries.AssignExamCommittee(ctx, sqlc.AssignExamCommitteeParams{
		ExamID:    eUID,
		TeacherID: tUID,
		Role:      role,
	})
	if err != nil {
		return utils.Internal(err)
	}
	return nil
}

// RemoveCommittee removes a committee member from an exam.
func (s *ExamService) RemoveCommittee(ctx context.Context, examID, teacherID string) error {
	eUID, err := parseUUID(examID)
	if err != nil {
		return utils.BadRequest("Invalid exam ID.")
	}
	tUID, err := parseUUID(teacherID)
	if err != nil {
		return utils.BadRequest("Invalid teacher ID.")
	}

	return s.queries.RemoveExamCommittee(ctx, sqlc.RemoveExamCommitteeParams{
		ExamID:    eUID,
		TeacherID: tUID,
	})
}

// SubmitScore records or updates a committee member's score for a criterion.
func (s *ExamService) SubmitScore(ctx context.Context, params SubmitScoreParams) error {
	eUID, err := parseUUID(params.ExamID)
	if err != nil {
		return utils.BadRequest("Invalid exam ID.")
	}
	cUID, err := parseUUID(params.CriteriaID)
	if err != nil {
		return utils.BadRequest("Invalid criteria ID.")
	}
	mUID, err := parseUUID(params.CommitteeMemberID)
	if err != nil {
		return utils.BadRequest("Invalid committee member ID.")
	}

	_, err = s.queries.UpsertEvaluationScore(ctx, sqlc.UpsertEvaluationScoreParams{
		ExamID:            eUID,
		CriteriaID:        cUID,
		CommitteeMemberID: mUID,
		Score:             pgNumeric(params.Score),
		Comment:           params.Comment,
	})
	if err != nil {
		return utils.Internal(err)
	}
	return nil
}

type SubmitScoreParams struct {
	ExamID            string  `json:"exam_id"`
	CriteriaID        string  `json:"criteria_id" binding:"required"`
	CommitteeMemberID string  `json:"committee_member_id" binding:"required"`
	Score             float64 `json:"score" binding:"required"`
	Comment           string  `json:"comment"`
}

// CalculateResult computes the weighted average score and determines the result.
// This is THE critical server-side calculation — the frontend never computes this.
func (s *ExamService) CalculateResult(ctx context.Context, examID string) (*CalculatedResult, error) {
	eUID, err := parseUUID(examID)
	if err != nil {
		return nil, utils.BadRequest("Invalid exam ID.")
	}

	exam, err := s.queries.GetExamByID(ctx, eUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Exam not found.")
		}
		return nil, utils.Internal(err)
	}

	summary, err := s.queries.GetExamScoreSummary(ctx, sqlc.GetExamScoreSummaryParams{
		ExamID:       eUID,
		ExamTypeCode: exam.ExamTypeCode,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	if len(summary) == 0 {
		return nil, utils.BadRequest("No evaluation criteria found for this exam type.")
	}

	// Compute weighted average: sum(avg_score * weight) / sum(weight)
	var totalWeightedScore float64
	var totalWeight float64

	criteria := make([]ScoreSummaryItem, len(summary))
	for i, row := range summary {
		maxScore := numericToFloat(row.MaxScore)
		weight := numericToFloat(row.Weight)
		avgScore := numericToFloat(row.AvgScore)

		// Normalise score to 0–100 scale, then apply weight
		normalised := 0.0
		if maxScore > 0 {
			normalised = (avgScore / maxScore) * 100.0
		}
		totalWeightedScore += normalised * weight
		totalWeight += weight

		criteria[i] = ScoreSummaryItem{
			CriteriaID:   formatUUID(row.CriteriaID),
			CriteriaName: row.CriteriaName,
			MaxScore:     maxScore,
			Weight:       weight,
			AvgScore:     avgScore,
			ScorerCount:  int(row.ScorerCount),
		}
	}

	weightedAvg := 0.0
	if totalWeight > 0 {
		weightedAvg = totalWeightedScore / totalWeight
	}
	weightedAvg = math.Round(weightedAvg*100) / 100

	// Determine result
	result := ExamResultFail
	if weightedAvg >= PassThreshold {
		result = ExamResultPass
	}

	return &CalculatedResult{
		WeightedAverage: weightedAvg,
		Result:          result,
		Criteria:        criteria,
	}, nil
}

// FinalizeResult records the committee decision (PASS/FAIL) and transitions
// the exam to COMPLETED status. Also writes an audit log entry.
func (s *ExamService) FinalizeResult(ctx context.Context, examID, actorID, decision string, notes *string) (*ExamDetail, error) {
	if decision != ExamResultPass && decision != ExamResultFail {
		return nil, utils.BadRequest("Result decision must be PASS or FAIL.")
	}

	eUID, err := parseUUID(examID)
	if err != nil {
		return nil, utils.BadRequest("Invalid exam ID.")
	}

	actorUUID, err := parseUUID(actorID)
	if err != nil {
		return nil, utils.BadRequest("Invalid actor ID.")
	}

	resultNotes := ""
	if notes != nil {
		resultNotes = *notes
	}

	// Calculate score summary for reporting and auditing if scores are present
	var scoreSummary *CalculatedResult
	calc, err := s.CalculateResult(ctx, examID)
	if err == nil {
		scoreSummary = calc
		if resultNotes == "" {
			resultNotes = fmt.Sprintf("Decision: %s. Weighted average: %.2f/100", decision, calc.WeightedAverage)
		}
	}

	exam, err := s.queries.UpdateExamResult(ctx, sqlc.UpdateExamResultParams{
		ID:          eUID,
		Result:      pgtype.Text{String: decision, Valid: true},
		ResultNotes: resultNotes,
		DecidedBy:   actorUUID,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	// Audit log
	logData := map[string]interface{}{
		"result":       decision,
		"result_notes": resultNotes,
	}
	if scoreSummary != nil {
		logData["weighted_average"] = scoreSummary.WeightedAverage
	}
	newJSON, _ := json.Marshal(logData)

	_ = s.queries.InsertAuditLog(ctx, sqlc.InsertAuditLogParams{
		ActorID:    actorUUID,
		Action:     "exam.result_finalized",
		EntityType: pgtype.Text{String: "exam", Valid: true},
		EntityID:   pgtype.Text{String: formatUUID(eUID), Valid: true},
		OldValues:  []byte("{}"),
		NewValues:  newJSON,
		Metadata:   []byte("{}"),
	})

	return s.examToDetail(ctx, exam)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func (s *ExamService) examToDetail(ctx context.Context, e sqlc.Exam) (*ExamDetail, error) {
	committees, err := s.queries.ListExamCommittees(ctx, e.ID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	committeeItems := make([]CommitteeItem, len(committees))
	for i, c := range committees {
		committeeItems[i] = CommitteeItem{
			ID:            formatUUID(c.ID),
			TeacherID:     formatUUID(c.TeacherID),
			Role:          c.Role,
			AcademicTitle: c.AcademicTitle,
			DisplayName:   textToPtr(c.DisplayName),
			Department:    c.Department,
		}
	}

	return &ExamDetail{
		ID:            formatUUID(e.ID),
		ThesisID:      formatUUID(e.ThesisID),
		ExamTypeCode:  e.ExamTypeCode,
		RoomID:        uuidToPtr(e.RoomID),
		RoundID:       uuidToPtr(e.RoundID),
		AttemptNo:     e.AttemptNo,
		Status:        e.Status,
		ScheduledDate: pgDateToPtr(e.ScheduledDate),
		StartTime:     pgTimeToPtr(e.StartTime),
		EndTime:       pgTimeToPtr(e.EndTime),
		Notes:         e.Notes,
		Result:        textToPtr(pgtype.Text{String: e.Result.String, Valid: e.Result.Valid}),
		ResultNotes:   e.ResultNotes,
		DecidedBy:     uuidToPtr(e.DecidedBy),
		DecidedAt:     pgTimestamptzToPtr(e.DecidedAt),
		CreatedAt:     formatTimestamp(e.CreatedAt),
		UpdatedAt:     formatTimestamp(e.UpdatedAt),
		Committee:     committeeItems,
	}, nil
}

func isValidExamTransition(from, to string) bool {
	allowed, ok := validExamTransitions[from]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}

func (s *ExamService) ListRounds(ctx context.Context, academicYear int32, period string) ([]ExamRoundItem, error) {
	rows, err := s.queries.ListExamRounds(ctx, sqlc.ListExamRoundsParams{
		Column1: academicYear,
		Column2: period,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]ExamRoundItem, len(rows))
	for i, r := range rows {
		items[i] = ExamRoundItem{
			ID:           formatUUID(r.ID),
			AcademicYear: r.AcademicYear,
			Period:       r.Period,
			RoundNo:      r.RoundNo,
			Name:         r.Name,
			StartDate:    pgDateToPtr(r.StartDate),
			EndDate:      pgDateToPtr(r.EndDate),
			Status:       r.Status,
			ClosedAt:     pgTimestamptzToPtr(r.ClosedAt),
		}
	}
	return items, nil
}

func (s *ExamService) GetRound(ctx context.Context, roundID string) (*ExamRoundItem, error) {
	uid, err := parseUUID(roundID)
	if err != nil {
		return nil, utils.BadRequest("Invalid round ID.")
	}

	r, err := s.queries.GetExamRoundByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Exam round not found.")
		}
		return nil, utils.Internal(err)
	}

	return &ExamRoundItem{
		ID:           formatUUID(r.ID),
		AcademicYear: r.AcademicYear,
		Period:       r.Period,
		RoundNo:      r.RoundNo,
		Name:         r.Name,
		StartDate:    pgDateToPtr(r.StartDate),
		EndDate:      pgDateToPtr(r.EndDate),
		Status:       r.Status,
		ClosedAt:     pgTimestamptzToPtr(r.ClosedAt),
	}, nil
}

func (s *ExamService) CreateRound(ctx context.Context, academicYear int32, period string, roundNo int32, name, startDate, endDate string) (*ExamRoundItem, error) {
	if period != "PROPOSAL" && period != "FINAL" {
		return nil, utils.BadRequest("period must be PROPOSAL or FINAL.")
	}
	if roundNo <= 0 {
		return nil, utils.BadRequest("round_no must be positive.")
	}

	r, err := s.queries.CreateExamRound(ctx, sqlc.CreateExamRoundParams{
		AcademicYear: academicYear,
		Period:       period,
		RoundNo:      roundNo,
		Name:         name,
		StartDate:    dateToPgDate(&startDate),
		EndDate:      dateToPgDate(&endDate),
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return &ExamRoundItem{
		ID:           formatUUID(r.ID),
		AcademicYear: r.AcademicYear,
		Period:       r.Period,
		RoundNo:      r.RoundNo,
		Name:         r.Name,
		StartDate:    pgDateToPtr(r.StartDate),
		EndDate:      pgDateToPtr(r.EndDate),
		Status:       r.Status,
		ClosedAt:     pgTimestamptzToPtr(r.ClosedAt),
	}, nil
}

func (s *ExamService) CloseRound(ctx context.Context, roundID string) (*ExamRoundItem, error) {
	uid, err := parseUUID(roundID)
	if err != nil {
		return nil, utils.BadRequest("Invalid round ID.")
	}

	r, err := s.queries.CloseExamRound(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	return &ExamRoundItem{
		ID:           formatUUID(r.ID),
		AcademicYear: r.AcademicYear,
		Period:       r.Period,
		RoundNo:      r.RoundNo,
		Name:         r.Name,
		StartDate:    pgDateToPtr(r.StartDate),
		EndDate:      pgDateToPtr(r.EndDate),
		Status:       r.Status,
		ClosedAt:     pgTimestamptzToPtr(r.ClosedAt),
	}, nil
}

func (s *ExamService) ListRoundRooms(ctx context.Context, roundID string) ([]RoundRoomItem, error) {
	uid, err := parseUUID(roundID)
	if err != nil {
		return nil, utils.BadRequest("Invalid round ID.")
	}

	rows, err := s.queries.ListExamRoundRooms(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]RoundRoomItem, len(rows))
	for i, r := range rows {
		items[i] = RoundRoomItem{
			RoundID:      formatUUID(r.RoundID),
			RoomID:       formatUUID(r.RoomID),
			RoomName:     r.RoomName,
			Building:     r.Building,
			Floor:        r.Floor,
			Capacity:     r.Capacity,
			CategoryCode: r.CategoryCode,
			CategoryName: r.CategoryName,
		}
	}
	return items, nil
}

func (s *ExamService) AssignRoundRoom(ctx context.Context, roundID, roomID, categoryCode string) (*RoundRoomItem, error) {
	rUID, err := parseUUID(roundID)
	if err != nil {
		return nil, utils.BadRequest("Invalid round ID.")
	}
	rmUID, err := parseUUID(roomID)
	if err != nil {
		return nil, utils.BadRequest("Invalid room ID.")
	}

	row, err := s.queries.AssignExamRoundRoom(ctx, sqlc.AssignExamRoundRoomParams{
		RoundID:      rUID,
		RoomID:       rmUID,
		CategoryCode: categoryCode,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return &RoundRoomItem{
		RoundID:      formatUUID(row.RoundID),
		RoomID:       formatUUID(row.RoomID),
		CategoryCode: row.CategoryCode,
	}, nil
}

func (s *ExamService) CalculateRoundCommitteeFees(ctx context.Context, roundID string) (*CommitteeFeeSummary, error) {
	uid, err := parseUUID(roundID)
	if err != nil {
		return nil, utils.BadRequest("Invalid round ID.")
	}

	round, err := s.queries.GetExamRoundByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Exam round not found.")
		}
		return nil, utils.Internal(err)
	}

	// Fetch active rates for BASE and RETAKE_BONUS
	rates, err := s.queries.ListActiveCommitteeRates(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	rateMap := make(map[string]float64)
	for _, r := range rates {
		key := fmt.Sprintf("%s_%s_%s", r.ExamTypeCode, r.Role, r.RateKind)
		val, _ := r.Amount.Float64Value()
		rateMap[key] = val.Float64
	}

	// Fetch all committees in round
	committeeRows, err := s.queries.ListExamCommitteesByRound(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	examSet := make(map[string]bool)
	var feeItems []CommitteeFeeItem
	totalAmount := 0.0

	for _, c := range committeeRows {
		examSet[formatUUID(c.ExamID)] = true
		baseKey := fmt.Sprintf("%s_%s_BASE", c.ExamTypeCode, c.Role)
		baseRate := rateMap[baseKey]

		retakeBonus := 0.0
		if c.AttemptNo >= 2 {
			bonusKey := fmt.Sprintf("%s_%s_RETAKE_BONUS", c.ExamTypeCode, c.Role)
			retakeBonus = rateMap[bonusKey]
		}

		itemTotal := baseRate + retakeBonus
		totalAmount += itemTotal

		displayName := ""
		if c.DisplayName.Valid {
			displayName = c.DisplayName.String
		}

		feeItems = append(feeItems, CommitteeFeeItem{
			ExamID:      formatUUID(c.ExamID),
			TeacherID:   formatUUID(c.TeacherID),
			TeacherName: displayName,
			Role:        c.Role,
			AttemptNo:   c.AttemptNo,
			BaseRate:    baseRate,
			RetakeBonus: retakeBonus,
			TotalFee:    itemTotal,
		})
	}

	return &CommitteeFeeSummary{
		RoundID:        formatUUID(round.ID),
		AcademicYear:   round.AcademicYear,
		Period:         round.Period,
		RoundNo:        round.RoundNo,
		ExamCount:      len(examSet),
		TotalAmount:    totalAmount,
		Currency:       "LAK",
		CommitteeItems: feeItems,
	}, nil
}

func uuidToPtr(u pgtype.UUID) *string {
	if !u.Valid {
		return nil
	}
	s := formatUUID(u)
	return &s
}

func pgTimestamptzToPtr(t pgtype.Timestamptz) *string {
	if !t.Valid {
		return nil
	}
	s := formatTimestamp(t)
	return &s
}

func pgDateToPtr(d pgtype.Date) *string {
	if !d.Valid {
		return nil
	}
	s := d.Time.Format("2006-01-02")
	return &s
}

func pgTimeToPtr(t pgtype.Time) *string {
	if !t.Valid {
		return nil
	}
	hours := t.Microseconds / 3600000000
	minutes := (t.Microseconds % 3600000000) / 60000000
	s := fmt.Sprintf("%02d:%02d", hours, minutes)
	return &s
}

func dateToPgDate(s *string) pgtype.Date {
	if s == nil || *s == "" {
		return pgtype.Date{}
	}
	var d pgtype.Date
	_ = d.Scan(*s)
	return d
}

func timeToPgTime(s *string) pgtype.Time {
	if s == nil || *s == "" {
		return pgtype.Time{}
	}
	var t pgtype.Time
	_ = t.Scan(*s)
	return t
}

func pgNumeric(f float64) pgtype.Numeric {
	var n pgtype.Numeric
	_ = n.Scan(fmt.Sprintf("%.2f", f))
	return n
}

func numericToFloat(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0
	}
	f, _ := n.Float64Value()
	return f.Float64
}
