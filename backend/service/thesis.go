package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ---------------------------------------------------------------------------
// Status constants and valid transitions
// ---------------------------------------------------------------------------

const (
	ThesisStatusDraft                 = "DRAFT"
	ThesisStatusProposed              = "PROPOSED"
	ThesisStatusTopicApproved         = "TOPIC_APPROVED"
	ThesisStatusInProgress            = "IN_PROGRESS"
	ThesisStatusProposalExamScheduled = "PROPOSAL_EXAM_SCHEDULED"
	ThesisStatusProposalPassed        = "PROPOSAL_PASSED"
	ThesisStatusDevelopment           = "DEVELOPMENT"
	ThesisStatusFinalSubmitted        = "FINAL_SUBMITTED"
	ThesisStatusFinalExamScheduled    = "FINAL_EXAM_SCHEDULED"
	ThesisStatusFinalPassed           = "FINAL_PASSED"
	ThesisStatusRevisionRequired      = "REVISION_REQUIRED"
	ThesisStatusCompleted             = "COMPLETED"
	ThesisStatusCancelled             = "CANCELLED"
)

// validTransitions maps each thesis status to its allowed next statuses.
var validTransitions = map[string][]string{
	ThesisStatusDraft:                 {ThesisStatusProposed, ThesisStatusCancelled},
	ThesisStatusProposed:              {ThesisStatusTopicApproved, ThesisStatusDraft, ThesisStatusCancelled},
	ThesisStatusTopicApproved:         {ThesisStatusInProgress, ThesisStatusCancelled},
	ThesisStatusInProgress:            {ThesisStatusProposalExamScheduled, ThesisStatusCancelled},
	ThesisStatusProposalExamScheduled: {ThesisStatusProposalPassed, ThesisStatusInProgress},
	ThesisStatusProposalPassed:        {ThesisStatusDevelopment},
	ThesisStatusDevelopment:           {ThesisStatusFinalSubmitted},
	ThesisStatusFinalSubmitted:        {ThesisStatusFinalExamScheduled, ThesisStatusDevelopment},
	ThesisStatusFinalExamScheduled:    {ThesisStatusFinalPassed, ThesisStatusDevelopment},
	ThesisStatusFinalPassed:           {ThesisStatusRevisionRequired, ThesisStatusCompleted},
	ThesisStatusRevisionRequired:      {ThesisStatusCompleted},
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

type ThesisDetail struct {
	ID           string        `json:"id"`
	TopicTH      string        `json:"topic_th"`
	TopicEN      string        `json:"topic_en"`
	AbstractTH   string        `json:"abstract_th"`
	AbstractEN   string        `json:"abstract_en"`
	CategoryCode *string       `json:"category_code,omitempty"`
	Status       string        `json:"status"`
	AcademicYear *int32        `json:"academic_year"`
	Semester     *int32        `json:"semester"`
	CreatedAt    string        `json:"created_at"`
	UpdatedAt    string        `json:"updated_at"`
	SubmittedAt  *string       `json:"submitted_at"`
	ApprovedAt   *string       `json:"approved_at"`
	CompletedAt  *string       `json:"completed_at"`
	Members      []MemberItem  `json:"members,omitempty"`
	Advisors     []AdvisorItem `json:"advisors,omitempty"`
}

type ThesisListItem struct {
	ID           string  `json:"id"`
	TopicTH      string  `json:"topic_th"`
	TopicEN      string  `json:"topic_en"`
	CategoryCode *string `json:"category_code,omitempty"`
	Status       string  `json:"status"`
	AcademicYear *int32  `json:"academic_year"`
	Semester     *int32  `json:"semester"`
	UpdatedAt    string  `json:"updated_at"`
}

type MemberItem struct {
	ID          string  `json:"id"`
	StudentCode string  `json:"student_code"`
	DisplayName *string `json:"display_name"`
	Department  string  `json:"department"`
	IsLeader    bool    `json:"is_leader"`
}

type AdvisorItem struct {
	ID            string  `json:"id"`
	AcademicTitle string  `json:"academic_title"`
	DisplayName   *string `json:"display_name"`
	Department    string  `json:"department"`
	IsPrimary     bool    `json:"is_primary"`
}

type StatusCount struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type CategoryItem struct {
	Code      string `json:"code"`
	Name      string `json:"name"`
	SortOrder int32  `json:"sort_order"`
	GlobalCap *int32 `json:"global_cap,omitempty"`
}

type AcademicStageItem struct {
	StageNo       int32  `json:"stage_no"`
	NameLO        string `json:"name_lo"`
	NameEN        string `json:"name_en"`
	PlannedWindow string `json:"planned_window"`
	Phase         string `json:"phase"`
	BTMSModule    string `json:"btms_module"`
	SortOrder     int32  `json:"sort_order"`
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

type ThesisService struct {
	queries *sqlc.Queries
}

func NewThesisService(queries *sqlc.Queries) *ThesisService {
	return &ThesisService{queries: queries}
}

// CreateThesis creates a new thesis in DRAFT status with the specified members and advisor.
// Enforces the department-wide cap for categories with global quotas (e.g. Multimedia max 12).
func (s *ThesisService) CreateThesis(ctx context.Context, params CreateThesisParams) (*ThesisDetail, error) {
	if params.CategoryCode != nil && *params.CategoryCode != "" {
		category, err := s.queries.GetCategoryByCode(ctx, *params.CategoryCode)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, utils.BadRequest(fmt.Sprintf("Invalid thesis category code %q.", *params.CategoryCode))
			}
			return nil, utils.Internal(err)
		}
		if category.GlobalCap.Valid && category.GlobalCap.Int32 > 0 {
			activeCount, err := s.queries.CountActiveThesesByCategory(ctx, pgtype.Text{String: *params.CategoryCode, Valid: true})
			if err != nil {
				return nil, utils.Internal(err)
			}
			if activeCount >= category.GlobalCap.Int32 {
				return nil, utils.BadRequest(fmt.Sprintf("Category %s has reached the maximum departmental quota of %d groups.", category.Name, category.GlobalCap.Int32))
			}
		}
	}

	thesis, err := s.queries.CreateThesis(ctx, sqlc.CreateThesisParams{
		TopicTh:      params.TopicTH,
		TopicEn:      params.TopicEN,
		AbstractTh:   params.AbstractTH,
		AbstractEn:   params.AbstractEN,
		Status:       ThesisStatusDraft,
		AcademicYear: int4Ptr(params.AcademicYear),
		Semester:     int4Ptr(params.Semester),
		CategoryCode: textToPg(params.CategoryCode),
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.thesisToDetail(ctx, thesis)
}

type CreateThesisParams struct {
	TopicTH      string  `json:"topic_th"`
	TopicEN      string  `json:"topic_en"`
	AbstractTH   string  `json:"abstract_th"`
	AbstractEN   string  `json:"abstract_en"`
	CategoryCode *string `json:"category_code"`
	AcademicYear *int32  `json:"academic_year"`
	Semester     *int32  `json:"semester"`
}

// GetThesis returns a thesis with its members and advisors.
func (s *ThesisService) GetThesis(ctx context.Context, thesisID string) (*ThesisDetail, error) {
	uid, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis ID.")
	}

	thesis, err := s.queries.GetThesisByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Thesis not found.")
		}
		return nil, utils.Internal(err)
	}

	return s.thesisToDetail(ctx, thesis)
}

// ListTheses returns a filtered, paginated list of theses.
func (s *ThesisService) ListTheses(ctx context.Context, statusFilter string, limit, offset int32) ([]ThesisListItem, error) {
	rows, err := s.queries.ListThesesByStatus(ctx, sqlc.ListThesesByStatusParams{
		Column1: statusFilter,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]ThesisListItem, len(rows))
	for i, r := range rows {
		items[i] = ThesisListItem{
			ID:           formatUUID(r.ID),
			TopicTH:      r.TopicTh,
			TopicEN:      r.TopicEn,
			Status:       r.Status,
			AcademicYear: int4ToPtr(r.AcademicYear),
			Semester:     int4ToPtr(r.Semester),
			UpdatedAt:    formatTimestamp(r.UpdatedAt),
		}
	}
	return items, nil
}

// ListMyTheses returns theses belonging to the authenticated user (as student or advisor).
func (s *ThesisService) ListMyTheses(ctx context.Context, profileID string) ([]ThesisListItem, error) {
	uid, err := parseUUID(profileID)
	if err != nil {
		return nil, utils.BadRequest("Invalid profile ID.")
	}

	// Try as student first.
	studentRows, err := s.queries.ListThesesByStudentProfile(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	// Then as advisor.
	advisorRows, err := s.queries.ListThesesByAdvisorProfile(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	// Merge, dedup by ID.
	seen := make(map[string]bool)
	var items []ThesisListItem

	for _, r := range studentRows {
		id := formatUUID(r.ID)
		if seen[id] {
			continue
		}
		seen[id] = true
		items = append(items, thesisRowToListItem(r))
	}
	for _, r := range advisorRows {
		id := formatUUID(r.ID)
		if seen[id] {
			continue
		}
		seen[id] = true
		items = append(items, thesisRowToListItem(r))
	}

	if items == nil {
		items = []ThesisListItem{}
	}
	return items, nil
}

// UpdateTopics updates the thesis title, abstract, and category fields.
func (s *ThesisService) UpdateTopics(ctx context.Context, thesisID string, params UpdateTopicsParams) (*ThesisDetail, error) {
	uid, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis ID.")
	}

	if params.CategoryCode != nil && *params.CategoryCode != "" {
		category, err := s.queries.GetCategoryByCode(ctx, *params.CategoryCode)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, utils.BadRequest(fmt.Sprintf("Invalid thesis category code %q.", *params.CategoryCode))
			}
			return nil, utils.Internal(err)
		}
		if category.GlobalCap.Valid && category.GlobalCap.Int32 > 0 {
			activeCount, err := s.queries.CountActiveThesesByCategory(ctx, pgtype.Text{String: *params.CategoryCode, Valid: true})
			if err != nil {
				return nil, utils.Internal(err)
			}
			if activeCount >= category.GlobalCap.Int32 {
				return nil, utils.BadRequest(fmt.Sprintf("Category %s has reached the maximum departmental quota of %d groups.", category.Name, category.GlobalCap.Int32))
			}
		}
	}

	thesis, err := s.queries.UpdateThesisTopics(ctx, sqlc.UpdateThesisTopicsParams{
		ID:           uid,
		TopicTh:      params.TopicTH,
		TopicEn:      params.TopicEN,
		AbstractTh:   params.AbstractTH,
		AbstractEn:   params.AbstractEN,
		CategoryCode: textToPg(params.CategoryCode),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Thesis not found.")
		}
		return nil, utils.Internal(err)
	}

	return s.thesisToDetail(ctx, thesis)
}

type UpdateTopicsParams struct {
	TopicTH      string  `json:"topic_th"`
	TopicEN      string  `json:"topic_en"`
	AbstractTH   string  `json:"abstract_th"`
	AbstractEN   string  `json:"abstract_en"`
	CategoryCode *string `json:"category_code"`
}

// TransitionStatus moves a thesis to a new status after validating the transition.
// It enforces 2–3 students per group and category limits during submission/approval,
// and writes an audit log entry.
func (s *ThesisService) TransitionStatus(ctx context.Context, thesisID, newStatus, actorID string) (*ThesisDetail, error) {
	uid, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis ID.")
	}

	current, err := s.queries.GetThesisByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Thesis not found.")
		}
		return nil, utils.Internal(err)
	}

	if !isValidTransition(current.Status, newStatus) {
		return nil, utils.BadRequest(fmt.Sprintf(
			"Cannot transition from %q to %q.", current.Status, newStatus,
		))
	}

	// Academic Rule 1: Group size strictly 2-3 students upon submission or approval.
	if newStatus == ThesisStatusProposed || newStatus == ThesisStatusTopicApproved {
		memberCount, err := s.queries.CountThesisMembers(ctx, uid)
		if err != nil {
			return nil, utils.Internal(err)
		}
		if memberCount < 2 || memberCount > 3 {
			return nil, utils.BadRequest(fmt.Sprintf(
				"Thesis group must have strictly 2 to 3 students (ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ). Currently has %d student(s).",
				memberCount,
			))
		}

		// Rule 1.3: Multimedia cap of 12 groups total.
		if current.CategoryCode.Valid && current.CategoryCode.String == "MULTIMEDIA" && current.Status == ThesisStatusDraft {
			activeCount, err := s.queries.CountActiveThesesByCategory(ctx, current.CategoryCode)
			if err != nil {
				return nil, utils.Internal(err)
			}
			if activeCount >= 12 {
				return nil, utils.BadRequest("Multimedia category has reached the maximum departmental quota of 12 groups.")
			}
		}
	}

	thesis, err := s.queries.UpdateThesisStatus(ctx, sqlc.UpdateThesisStatusParams{
		ID:     uid,
		Status: newStatus,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	// Update milestone timestamps.
	switch newStatus {
	case ThesisStatusProposed:
		_ = s.queries.SetThesisSubmittedAt(ctx, uid)
	case ThesisStatusTopicApproved:
		_ = s.queries.SetThesisApprovedAt(ctx, uid)
	case ThesisStatusCompleted:
		_ = s.queries.SetThesisCompletedAt(ctx, uid)
	}

	// Write audit log.
	actorUUID, _ := parseUUID(actorID)
	oldJSON, _ := json.Marshal(map[string]string{"status": current.Status})
	newJSON, _ := json.Marshal(map[string]string{"status": newStatus})
	_ = s.queries.InsertAuditLog(ctx, sqlc.InsertAuditLogParams{
		ActorID:    actorUUID,
		Action:     "thesis.status_change",
		EntityType: pgtype.Text{String: "thesis", Valid: true},
		EntityID:   pgtype.Text{String: formatUUID(uid), Valid: true},
		OldValues:  oldJSON,
		NewValues:  newJSON,
		Metadata:   []byte("{}"),
	})

	return s.thesisToDetail(ctx, thesis)
}

// AddMember adds a student to a thesis group.
// Strictly enforces 2 to 3 students per group.
func (s *ThesisService) AddMember(ctx context.Context, thesisID, studentID string, isLeader bool) error {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return utils.BadRequest("Invalid thesis ID.")
	}
	sUID, err := parseUUID(studentID)
	if err != nil {
		return utils.BadRequest("Invalid student ID.")
	}

	currentCount, err := s.queries.CountThesisMembers(ctx, tUID)
	if err != nil {
		return utils.Internal(err)
	}
	if currentCount >= 3 {
		return utils.BadRequest("Thesis groups are strictly limited to 2 to 3 students (ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ). Cannot add more members.")
	}

	_, err = s.queries.AddThesisMember(ctx, sqlc.AddThesisMemberParams{
		ThesisID:  tUID,
		StudentID: sUID,
		IsLeader:  isLeader,
	})
	if err != nil {
		return utils.Internal(err)
	}
	return nil
}

// RemoveMember removes a student from a thesis group.
func (s *ThesisService) RemoveMember(ctx context.Context, thesisID, studentID string) error {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return utils.BadRequest("Invalid thesis ID.")
	}
	sUID, err := parseUUID(studentID)
	if err != nil {
		return utils.BadRequest("Invalid student ID.")
	}

	return s.queries.RemoveThesisMember(ctx, sqlc.RemoveThesisMemberParams{
		ThesisID:  tUID,
		StudentID: sUID,
	})
}

// AssignAdvisor assigns a teacher as advisor (primary or co-advisor).
// Enforces individual advisor quota (assigned < quota) and category eligibility.
func (s *ThesisService) AssignAdvisor(ctx context.Context, thesisID, teacherID string, isPrimary bool) error {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return utils.BadRequest("Invalid thesis ID.")
	}
	tcUID, err := parseUUID(teacherID)
	if err != nil {
		return utils.BadRequest("Invalid teacher ID.")
	}

	// 1. Quota Validation
	stats, err := s.queries.GetTeacherQuotaStats(ctx, tcUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return utils.NotFound("Advisor not found.")
		}
		return utils.Internal(err)
	}
	if int32(stats.AssignedCount) >= stats.Quota {
		return utils.BadRequest(fmt.Sprintf(
			"Advisor has already reached maximum quota (%d/%d groups). Cannot accept more thesis groups.",
			stats.AssignedCount, stats.Quota,
		))
	}

	// 2. Category Eligibility Validation
	thesis, err := s.queries.GetThesisByID(ctx, tUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return utils.NotFound("Thesis not found.")
		}
		return utils.Internal(err)
	}
	if thesis.CategoryCode.Valid && thesis.CategoryCode.String != "" {
		expertise, err := s.queries.ListTeacherExpertiseByTeacherID(ctx, tcUID)
		if err != nil {
			return utils.Internal(err)
		}
		eligible := false
		for _, exp := range expertise {
			if exp.CategoryCode == thesis.CategoryCode.String {
				eligible = true
				break
			}
		}
		if !eligible {
			return utils.BadRequest(fmt.Sprintf(
				"Advisor is not eligible to supervise category %s.",
				thesis.CategoryCode.String,
			))
		}
	}

	_, err = s.queries.AssignThesisAdvisor(ctx, sqlc.AssignThesisAdvisorParams{
		ThesisID:  tUID,
		TeacherID: tcUID,
		IsPrimary: isPrimary,
	})
	if err != nil {
		return utils.Internal(err)
	}
	return nil
}

// RemoveAdvisor removes a teacher from the thesis advisor list.
func (s *ThesisService) RemoveAdvisor(ctx context.Context, thesisID, teacherID string) error {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return utils.BadRequest("Invalid thesis ID.")
	}
	tcUID, err := parseUUID(teacherID)
	if err != nil {
		return utils.BadRequest("Invalid teacher ID.")
	}

	return s.queries.RemoveThesisAdvisor(ctx, sqlc.RemoveThesisAdvisorParams{
		ThesisID:  tUID,
		TeacherID: tcUID,
	})
}

// CountByStatus returns thesis counts grouped by status.
func (s *ThesisService) CountByStatus(ctx context.Context) ([]StatusCount, error) {
	rows, err := s.queries.CountThesesByStatus(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	counts := make([]StatusCount, len(rows))
	for i, r := range rows {
		counts[i] = StatusCount{
			Status: r.Status,
			Count:  int(r.Count),
		}
	}
	return counts, nil
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

func (s *ThesisService) thesisToDetail(ctx context.Context, t sqlc.Thesis) (*ThesisDetail, error) {
	members, err := s.queries.ListThesisMembers(ctx, t.ID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	advisors, err := s.queries.ListThesisAdvisors(ctx, t.ID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	memberItems := make([]MemberItem, len(members))
	for i, m := range members {
		memberItems[i] = MemberItem{
			ID:          formatUUID(m.StudentID),
			StudentCode: m.StudentCode,
			DisplayName: textToPtr(m.DisplayName),
			Department:  m.Department,
			IsLeader:    m.IsLeader,
		}
	}

	advisorItems := make([]AdvisorItem, len(advisors))
	for i, a := range advisors {
		advisorItems[i] = AdvisorItem{
			ID:            formatUUID(a.TeacherID),
			AcademicTitle: a.AcademicTitle,
			DisplayName:   textToPtr(a.DisplayName),
			Department:    a.Department,
			IsPrimary:     a.IsPrimary,
		}
	}

	return &ThesisDetail{
		ID:           formatUUID(t.ID),
		TopicTH:      t.TopicTh,
		TopicEN:      t.TopicEn,
		AbstractTH:   t.AbstractTh,
		AbstractEN:   t.AbstractEn,
		CategoryCode: pgToTextPtr(t.CategoryCode),
		Status:       t.Status,
		AcademicYear: int4ToPtr(t.AcademicYear),
		Semester:     int4ToPtr(t.Semester),
		CreatedAt:    formatTimestamp(t.CreatedAt),
		UpdatedAt:    formatTimestamp(t.UpdatedAt),
		SubmittedAt:  timestampToPtr(t.SubmittedAt),
		ApprovedAt:   timestampToPtr(t.ApprovedAt),
		CompletedAt:  timestampToPtr(t.CompletedAt),
		Members:      memberItems,
		Advisors:     advisorItems,
	}, nil
}

func (s *ThesisService) ListCategories(ctx context.Context) ([]CategoryItem, error) {
	rows, err := s.queries.ListThesisCategories(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}
	items := make([]CategoryItem, len(rows))
	for i, r := range rows {
		items[i] = CategoryItem{
			Code:      r.Code,
			Name:      r.Name,
			SortOrder: r.SortOrder,
			GlobalCap: int4ToPtr(r.GlobalCap),
		}
	}
	return items, nil
}

func (s *ThesisService) ListAcademicStages(ctx context.Context) ([]AcademicStageItem, error) {
	rows, err := s.queries.ListAcademicStages(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}
	items := make([]AcademicStageItem, len(rows))
	for i, r := range rows {
		items[i] = AcademicStageItem{
			StageNo:       r.StageNo,
			NameLO:        r.NameLo,
			NameEN:        r.NameEn,
			PlannedWindow: r.PlannedWindow,
			Phase:         r.Phase,
			BTMSModule:    r.BtmsModule,
			SortOrder:     r.SortOrder,
		}
	}
	return items, nil
}

func thesisRowToListItem(t sqlc.Thesis) ThesisListItem {
	return ThesisListItem{
		ID:           formatUUID(t.ID),
		TopicTH:      t.TopicTh,
		TopicEN:      t.TopicEn,
		CategoryCode: pgToTextPtr(t.CategoryCode),
		Status:       t.Status,
		AcademicYear: int4ToPtr(t.AcademicYear),
		Semester:     int4ToPtr(t.Semester),
		UpdatedAt:    formatTimestamp(t.UpdatedAt),
	}
}

func isValidTransition(from, to string) bool {
	allowed, ok := validTransitions[from]
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

func int4Ptr(v *int32) pgtype.Int4 {
	if v == nil {
		return pgtype.Int4{}
	}
	return pgtype.Int4{Int32: *v, Valid: true}
}

func int4ToPtr(v pgtype.Int4) *int32 {
	if !v.Valid {
		return nil
	}
	return &v.Int32
}

func textToPg(v *string) pgtype.Text {
	if v == nil || *v == "" {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *v, Valid: true}
}

func pgToTextPtr(v pgtype.Text) *string {
	if !v.Valid {
		return nil
	}
	return &v.String
}

func timestampToPtr(t pgtype.Timestamptz) *string {
	if !t.Valid {
		return nil
	}
	s := formatTimestamp(t)
	return &s
}
