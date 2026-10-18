package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5"
)

// ---------------------------------------------------------------------------
// Response models
// ---------------------------------------------------------------------------

type StudentListItem struct {
	ID                 string  `json:"id"`
	ProfileID          string  `json:"profile_id"`
	StudentCode        string  `json:"student_code"`
	DisplayName        *string `json:"display_name"`
	Department         string  `json:"department"`
	Faculty            string  `json:"faculty"`
	ThesisID           *string `json:"thesis_id,omitempty"`
	ThesisTopicTH      *string `json:"thesis_topic_th,omitempty"`
	ThesisTopicEN      *string `json:"thesis_topic_en,omitempty"`
	ThesisStatus       *string `json:"thesis_status,omitempty"`
	IsLeader           *bool   `json:"is_leader,omitempty"`
	PrimaryAdvisorName *string `json:"primary_advisor_name,omitempty"`
	CreatedAt          string  `json:"created_at"`
	UpdatedAt          string  `json:"updated_at"`
}

type StudentDetail struct {
	ID          string  `json:"id"`
	ProfileID   string  `json:"profile_id"`
	StudentCode string  `json:"student_code"`
	Department  string  `json:"department"`
	Faculty     string  `json:"faculty"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

type TeacherListItem struct {
	ID             string  `json:"id"`
	ProfileID      string  `json:"profile_id"`
	AcademicTitle  string  `json:"academic_title"`
	DisplayName    *string `json:"display_name"`
	Department     string  `json:"department"`
	Faculty        string  `json:"faculty"`
	Affiliation    string  `json:"affiliation"`
	Quota          int     `json:"quota"`
	AvailableQuota int     `json:"available_quota"`
	AdvisingCount  int     `json:"advising_count"`
	CommitteeCount int     `json:"committee_count"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type TeacherDetail struct {
	ID            string  `json:"id"`
	ProfileID     string  `json:"profile_id"`
	AcademicTitle string  `json:"academic_title"`
	Department    string  `json:"department"`
	Faculty       string  `json:"faculty"`
	Affiliation   string  `json:"affiliation"`
	Quota         int     `json:"quota"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

type TeacherAdvisingItem struct {
	ThesisID     string  `json:"thesis_id"`
	TopicTH      string  `json:"topic_th"`
	TopicEN      string  `json:"topic_en"`
	Status       string  `json:"status"`
	AcademicYear *int32  `json:"academic_year"`
	Semester     *int32  `json:"semester"`
	IsPrimary    bool    `json:"is_primary"`
	AssignedAt   string  `json:"assigned_at"`
}

type TeacherCommitteeItem struct {
	ExamID        string  `json:"exam_id"`
	ThesisID      string  `json:"thesis_id"`
	ExamTypeCode  string  `json:"exam_type_code"`
	ScheduledDate *string `json:"scheduled_date"`
	StartTime     *string `json:"start_time"`
	EndTime       *string `json:"end_time"`
	ExamStatus    string  `json:"exam_status"`
	CommitteeRole string  `json:"committee_role"`
	TopicTH       string  `json:"topic_th"`
	TopicEN       string  `json:"topic_en"`
}

// ---------------------------------------------------------------------------
// Academic Service
// ---------------------------------------------------------------------------

type AcademicService struct {
	queries *sqlc.Queries
}

func NewAcademicService(queries *sqlc.Queries) *AcademicService {
	return &AcademicService{queries: queries}
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

func (s *AcademicService) ListStudents(ctx context.Context) ([]StudentListItem, error) {
	rows, err := s.queries.ListStudentsWithDetails(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]StudentListItem, len(rows))
	for i, r := range rows {
		item := StudentListItem{
			ID:          formatUUID(r.ID),
			ProfileID:   formatUUID(r.ProfileID),
			StudentCode: r.StudentCode,
			DisplayName: textToPtr(r.DisplayName),
			Department:  r.Department,
			Faculty:     r.Faculty,
			CreatedAt:   formatTimestamp(r.CreatedAt),
			UpdatedAt:   formatTimestamp(r.UpdatedAt),
		}

		if r.ThesisID.Valid {
			tid := formatUUID(r.ThesisID)
			item.ThesisID = &tid
			item.ThesisTopicTH = textToPtr(r.ThesisTopicTh)
			item.ThesisTopicEN = textToPtr(r.ThesisTopicEn)
			item.ThesisStatus = textToPtr(r.ThesisStatus)
			if r.IsLeader.Valid {
				item.IsLeader = &r.IsLeader.Bool
			}
			item.PrimaryAdvisorName = textToPtr(r.PrimaryAdvisorName)
		}

		items[i] = item
	}

	return items, nil
}

func (s *AcademicService) GetStudent(ctx context.Context, id string) (*StudentDetail, error) {
	uid, err := parseUUID(id)
	if err != nil {
		return nil, utils.BadRequest("Invalid student ID format.")
	}

	st, err := s.queries.GetStudentByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Student not found.")
		}
		return nil, utils.Internal(err)
	}

	return &StudentDetail{
		ID:          formatUUID(st.ID),
		ProfileID:   formatUUID(st.ProfileID),
		StudentCode: st.StudentCode,
		Department:  st.Department,
		Faculty:     st.Faculty,
		CreatedAt:   formatTimestamp(st.CreatedAt),
		UpdatedAt:   formatTimestamp(st.UpdatedAt),
	}, nil
}

func (s *AcademicService) CreateStudent(ctx context.Context, profileID, studentCode, department, faculty string) (*StudentDetail, error) {
	pUID, err := parseUUID(profileID)
	if err != nil {
		return nil, utils.BadRequest("Invalid profile ID.")
	}
	if studentCode == "" {
		return nil, utils.BadRequest("student_code is required.")
	}

	st, err := s.queries.CreateStudent(ctx, sqlc.CreateStudentParams{
		ProfileID:   pUID,
		StudentCode: studentCode,
		Department:  department,
		Faculty:     faculty,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return &StudentDetail{
		ID:          formatUUID(st.ID),
		ProfileID:   formatUUID(st.ProfileID),
		StudentCode: st.StudentCode,
		Department:  st.Department,
		Faculty:     st.Faculty,
		CreatedAt:   formatTimestamp(st.CreatedAt),
		UpdatedAt:   formatTimestamp(st.UpdatedAt),
	}, nil
}

func (s *AcademicService) UpdateStudent(ctx context.Context, id, studentCode, department, faculty string) (*StudentDetail, error) {
	uid, err := parseUUID(id)
	if err != nil {
		return nil, utils.BadRequest("Invalid student ID.")
	}
	if studentCode == "" {
		return nil, utils.BadRequest("student_code cannot be empty.")
	}

	st, err := s.queries.UpdateStudent(ctx, sqlc.UpdateStudentParams{
		ID:          uid,
		StudentCode: studentCode,
		Department:  department,
		Faculty:     faculty,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Student not found.")
		}
		return nil, utils.Internal(err)
	}

	return &StudentDetail{
		ID:          formatUUID(st.ID),
		ProfileID:   formatUUID(st.ProfileID),
		StudentCode: st.StudentCode,
		Department:  st.Department,
		Faculty:     st.Faculty,
		CreatedAt:   formatTimestamp(st.CreatedAt),
		UpdatedAt:   formatTimestamp(st.UpdatedAt),
	}, nil
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

func (s *AcademicService) ListTeachers(ctx context.Context) ([]TeacherListItem, error) {
	rows, err := s.queries.ListTeachersWithStats(ctx)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]TeacherListItem, len(rows))
	for i, r := range rows {
		quota := int(r.Quota)
		advising := int(r.AdvisingCount)
		avail := quota - advising
		if avail < 0 {
			avail = 0
		}
		items[i] = TeacherListItem{
			ID:             formatUUID(r.ID),
			ProfileID:      formatUUID(r.ProfileID),
			AcademicTitle:  r.AcademicTitle,
			DisplayName:    textToPtr(r.DisplayName),
			Department:     r.Department,
			Faculty:        r.Faculty,
			Affiliation:    r.Affiliation,
			Quota:          quota,
			AvailableQuota: avail,
			AdvisingCount:  advising,
			CommitteeCount: int(r.CommitteeCount),
			CreatedAt:      formatTimestamp(r.CreatedAt),
			UpdatedAt:      formatTimestamp(r.UpdatedAt),
		}
	}

	return items, nil
}

func (s *AcademicService) GetTeacher(ctx context.Context, id string) (*TeacherDetail, error) {
	uid, err := parseUUID(id)
	if err != nil {
		return nil, utils.BadRequest("Invalid teacher ID format.")
	}

	tc, err := s.queries.GetTeacherByID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Teacher not found.")
		}
		return nil, utils.Internal(err)
	}

	return &TeacherDetail{
		ID:            formatUUID(tc.ID),
		ProfileID:     formatUUID(tc.ProfileID),
		AcademicTitle: tc.AcademicTitle,
		Department:    tc.Department,
		Faculty:       tc.Faculty,
		Affiliation:   tc.Affiliation,
		Quota:         int(tc.Quota),
		CreatedAt:     formatTimestamp(tc.CreatedAt),
		UpdatedAt:     formatTimestamp(tc.UpdatedAt),
	}, nil
}

func (s *AcademicService) CreateTeacher(ctx context.Context, profileID, academicTitle, department, faculty, affiliation string, quota int32) (*TeacherDetail, error) {
	pUID, err := parseUUID(profileID)
	if err != nil {
		return nil, utils.BadRequest("Invalid profile ID.")
	}
	if quota <= 0 {
		quota = 5
	}
	if affiliation == "" {
		affiliation = "CEIT"
	}

	tc, err := s.queries.CreateTeacher(ctx, sqlc.CreateTeacherParams{
		ProfileID:     pUID,
		AcademicTitle: academicTitle,
		Department:    department,
		Faculty:       faculty,
		Column5:       affiliation,
		Column6:       quota,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return &TeacherDetail{
		ID:            formatUUID(tc.ID),
		ProfileID:     formatUUID(tc.ProfileID),
		AcademicTitle: tc.AcademicTitle,
		Department:    tc.Department,
		Faculty:       tc.Faculty,
		Affiliation:   tc.Affiliation,
		Quota:         int(tc.Quota),
		CreatedAt:     formatTimestamp(tc.CreatedAt),
		UpdatedAt:     formatTimestamp(tc.UpdatedAt),
	}, nil
}

func (s *AcademicService) UpdateTeacher(ctx context.Context, id, academicTitle, department, faculty, affiliation string, quota int32) (*TeacherDetail, error) {
	uid, err := parseUUID(id)
	if err != nil {
		return nil, utils.BadRequest("Invalid teacher ID.")
	}

	tc, err := s.queries.UpdateTeacher(ctx, sqlc.UpdateTeacherParams{
		ID:            uid,
		AcademicTitle: academicTitle,
		Department:    department,
		Faculty:       faculty,
		Column5:       affiliation,
		Column6:       quota,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.NotFound("Teacher not found.")
		}
		return nil, utils.Internal(err)
	}

	return &TeacherDetail{
		ID:            formatUUID(tc.ID),
		ProfileID:     formatUUID(tc.ProfileID),
		AcademicTitle: tc.AcademicTitle,
		Department:    tc.Department,
		Faculty:       tc.Faculty,
		Affiliation:   tc.Affiliation,
		Quota:         int(tc.Quota),
		CreatedAt:     formatTimestamp(tc.CreatedAt),
		UpdatedAt:     formatTimestamp(tc.UpdatedAt),
	}, nil
}

func (s *AcademicService) GetTeacherAdvising(ctx context.Context, teacherID string) ([]TeacherAdvisingItem, error) {
	uid, err := parseUUID(teacherID)
	if err != nil {
		return nil, utils.BadRequest("Invalid teacher ID.")
	}

	rows, err := s.queries.ListTeacherAdvisingTheses(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]TeacherAdvisingItem, len(rows))
	for i, r := range rows {
		items[i] = TeacherAdvisingItem{
			ThesisID:     formatUUID(r.ThesisID),
			TopicTH:      r.TopicTh,
			TopicEN:      r.TopicEn,
			Status:       r.Status,
			AcademicYear: int4ToPtr(r.AcademicYear),
			Semester:     int4ToPtr(r.Semester),
			IsPrimary:    r.IsPrimary,
			AssignedAt:   formatTimestamp(r.AssignedAt),
		}
	}

	return items, nil
}

func (s *AcademicService) GetTeacherCommittees(ctx context.Context, teacherID string) ([]TeacherCommitteeItem, error) {
	uid, err := parseUUID(teacherID)
	if err != nil {
		return nil, utils.BadRequest("Invalid teacher ID.")
	}

	rows, err := s.queries.ListTeacherCommittees(ctx, uid)
	if err != nil {
		return nil, utils.Internal(err)
	}

	items := make([]TeacherCommitteeItem, len(rows))
	for i, r := range rows {
		item := TeacherCommitteeItem{
			ExamID:        formatUUID(r.ExamID),
			ThesisID:      formatUUID(r.ThesisID),
			ExamTypeCode:  r.ExamTypeCode,
			ExamStatus:    r.ExamStatus,
			CommitteeRole: r.CommitteeRole,
			TopicTH:       r.TopicTh,
			TopicEN:       r.TopicEn,
		}
		if r.ScheduledDate.Valid {
			d := r.ScheduledDate.Time.Format("2006-01-02")
			item.ScheduledDate = &d
		}
		if r.StartTime.Valid {
			t := time.Duration(r.StartTime.Microseconds) * time.Microsecond
			s := fmt.Sprintf("%02d:%02d", int(t.Hours()), int(t.Minutes())%60)
			item.StartTime = &s
		}
		if r.EndTime.Valid {
			t := time.Duration(r.EndTime.Microseconds) * time.Microsecond
			s := fmt.Sprintf("%02d:%02d", int(t.Hours()), int(t.Minutes())%60)
			item.EndTime = &s
		}
		items[i] = item
	}

	return items, nil
}
