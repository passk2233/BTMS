package service

import (
	"context"
	"fmt"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/utils"
	"github.com/jackc/pgx/v5/pgtype"
)

type ThesisFileItem struct {
	ID            string  `json:"id"`
	ThesisID      string  `json:"thesis_id"`
	UploadedBy    string  `json:"uploaded_by"`
	FileType      string  `json:"file_type"`
	FileName      string  `json:"file_name"`
	StoragePath   string  `json:"storage_path"`
	FileSizeBytes *int64  `json:"file_size_bytes,omitempty"`
	MimeType      *string `json:"mime_type,omitempty"`
	Description   string  `json:"description"`
	UploadedAt    string  `json:"uploaded_at"`
}

type ThesisRevisionItem struct {
	ID             string  `json:"id"`
	ThesisID       string  `json:"thesis_id"`
	VersionNumber  int32   `json:"version_number"`
	SubmittedBy    string  `json:"submitted_by"`
	FileName       string  `json:"file_name"`
	StoragePath    string  `json:"storage_path"`
	Notes          string  `json:"notes"`
	Status         string  `json:"status"`
	ReviewedBy     *string `json:"reviewed_by,omitempty"`
	ReviewedAt     *string `json:"reviewed_at,omitempty"`
	ReviewComments string  `json:"review_comments"`
	SubmittedAt    string  `json:"submitted_at"`
}

type FileService struct {
	queries *sqlc.Queries
}

func NewFileService(queries *sqlc.Queries) *FileService {
	return &FileService{queries: queries}
}

type CreateFileInput struct {
	ThesisID      string  `json:"thesis_id" binding:"required"`
	FileType      string  `json:"file_type" binding:"required"`
	FileName      string  `json:"file_name" binding:"required"`
	StoragePath   string  `json:"storage_path" binding:"required"`
	FileSizeBytes *int64  `json:"file_size_bytes"`
	MimeType      *string `json:"mime_type"`
	Description   string  `json:"description"`
}

func (s *FileService) CreateFile(ctx context.Context, uploaderID string, input CreateFileInput) (*ThesisFileItem, error) {
	tUID, err := parseUUID(input.ThesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}
	uUID, err := parseUUID(uploaderID)
	if err != nil {
		return nil, utils.BadRequest("Invalid uploader user ID.")
	}

	var size pgtype.Int8
	if input.FileSizeBytes != nil {
		size = pgtype.Int8{Int64: *input.FileSizeBytes, Valid: true}
	}

	var mime pgtype.Text
	if input.MimeType != nil {
		mime = pgtype.Text{String: *input.MimeType, Valid: true}
	}

	row, err := s.queries.CreateThesisFile(ctx, sqlc.CreateThesisFileParams{
		ThesisID:      tUID,
		UploadedBy:    uUID,
		FileType:      input.FileType,
		FileName:      input.FileName,
		StoragePath:   input.StoragePath,
		FileSizeBytes: size,
		MimeType:      mime,
		Description:   input.Description,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.fileToDTO(row), nil
}

func (s *FileService) ListFilesByThesis(ctx context.Context, thesisID string) ([]ThesisFileItem, error) {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}

	rows, err := s.queries.ListThesisFiles(ctx, tUID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]ThesisFileItem, len(rows))
	for i, r := range rows {
		res[i] = *s.fileToDTO(r)
	}
	return res, nil
}

type CreateRevisionInput struct {
	ThesisID    string `json:"thesis_id" binding:"required"`
	FileName    string `json:"file_name" binding:"required"`
	StoragePath string `json:"storage_path" binding:"required"`
	Notes       string `json:"notes"`
}

func (s *FileService) CreateRevision(ctx context.Context, submitterID string, input CreateRevisionInput) (*ThesisRevisionItem, error) {
	tUID, err := parseUUID(input.ThesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}
	sUID, err := parseUUID(submitterID)
	if err != nil {
		return nil, utils.BadRequest("Invalid submitter user ID.")
	}

	// Compute next version number
	latest, err := s.queries.GetLatestRevision(ctx, tUID)
	var nextVer int32 = 1
	if err == nil {
		nextVer = latest.VersionNumber + 1
	}

	row, err := s.queries.CreateThesisRevision(ctx, sqlc.CreateThesisRevisionParams{
		ThesisID:      tUID,
		VersionNumber: nextVer,
		SubmittedBy:   sUID,
		FileName:      input.FileName,
		StoragePath:   input.StoragePath,
		Notes:         input.Notes,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.revisionToDTO(row), nil
}

func (s *FileService) ListRevisionsByThesis(ctx context.Context, thesisID string) ([]ThesisRevisionItem, error) {
	tUID, err := parseUUID(thesisID)
	if err != nil {
		return nil, utils.BadRequest("Invalid thesis_id.")
	}

	rows, err := s.queries.ListThesisRevisions(ctx, tUID)
	if err != nil {
		return nil, utils.Internal(err)
	}

	res := make([]ThesisRevisionItem, len(rows))
	for i, r := range rows {
		res[i] = *s.revisionToDTO(r)
	}
	return res, nil
}

func (s *FileService) ReviewRevision(ctx context.Context, reviewerID string, revisionID string, status string, comments string) (*ThesisRevisionItem, error) {
	rUID, err := parseUUID(revisionID)
	if err != nil {
		return nil, utils.BadRequest("Invalid revision_id.")
	}
	rvUID, err := parseUUID(reviewerID)
	if err != nil {
		return nil, utils.BadRequest("Invalid reviewer user ID.")
	}

	if status != "APPROVED" && status != "REJECTED" && status != "UNDER_REVIEW" {
		return nil, utils.BadRequest(fmt.Sprintf("Invalid review status %q.", status))
	}

	row, err := s.queries.UpdateRevisionStatus(ctx, sqlc.UpdateRevisionStatusParams{
		ID:             rUID,
		Status:         status,
		ReviewedBy:     rvUID,
		ReviewComments: comments,
	})
	if err != nil {
		return nil, utils.Internal(err)
	}

	return s.revisionToDTO(row), nil
}

func (s *FileService) fileToDTO(r sqlc.ThesisFile) *ThesisFileItem {
	var size *int64
	if r.FileSizeBytes.Valid {
		size = &r.FileSizeBytes.Int64
	}
	var mime *string
	if r.MimeType.Valid {
		mime = &r.MimeType.String
	}

	return &ThesisFileItem{
		ID:            formatUUID(r.ID),
		ThesisID:      formatUUID(r.ThesisID),
		UploadedBy:    formatUUID(r.UploadedBy),
		FileType:      r.FileType,
		FileName:      r.FileName,
		StoragePath:   r.StoragePath,
		FileSizeBytes: size,
		MimeType:      mime,
		Description:   r.Description,
		UploadedAt:    formatTimestamp(r.UploadedAt),
	}
}

func (s *FileService) revisionToDTO(r sqlc.ThesisRevision) *ThesisRevisionItem {
	return &ThesisRevisionItem{
		ID:             formatUUID(r.ID),
		ThesisID:       formatUUID(r.ThesisID),
		VersionNumber:  r.VersionNumber,
		SubmittedBy:    formatUUID(r.SubmittedBy),
		FileName:       r.FileName,
		StoragePath:    r.StoragePath,
		Notes:          r.Notes,
		Status:         r.Status,
		ReviewedBy:     uuidToPtr(r.ReviewedBy),
		ReviewedAt:     pgTimestamptzToPtr(r.ReviewedAt),
		ReviewComments: r.ReviewComments,
		SubmittedAt:    formatTimestamp(r.SubmittedAt),
	}
}
