package utils

import (
	"errors"
	"net/http"
	"testing"
)

func TestAPIErrors(t *testing.T) {
	tests := []struct {
		name       string
		err        *APIError
		wantStatus int
		wantCode   string
	}{
		{"BadRequest", BadRequest("bad input"), http.StatusBadRequest, "bad_request"},
		{"Unauthorized", Unauthorized("unauth"), http.StatusUnauthorized, "unauthorized"},
		{"Forbidden", Forbidden("forbid"), http.StatusForbidden, "forbidden"},
		{"NotFound", NotFound("not found"), http.StatusNotFound, "not_found"},
		{"Internal", Internal(errors.New("db error")), http.StatusInternalServerError, "internal_error"},
		{"NotImplemented", NotImplemented(), http.StatusNotImplemented, "not_implemented"},
		{"ServiceUnavailable", ServiceUnavailable(), http.StatusServiceUnavailable, "service_unavailable"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.err.Status != tt.wantStatus {
				t.Errorf("got status %d, want %d", tt.err.Status, tt.wantStatus)
			}
			if tt.err.Code != tt.wantCode {
				t.Errorf("got code %q, want %q", tt.err.Code, tt.wantCode)
			}
		})
	}
}
