package utils

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	RequestIDContextKey = "request_id"
	RequestIDHeader     = "X-Request-ID"
)

type APIError struct {
	Status  int
	Code    string
	Message string
	Err     error
}

func (e *APIError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Message
}

func (e *APIError) Unwrap() error {
	return e.Err
}

func NotImplemented() *APIError {
	return &APIError{
		Status:  http.StatusNotImplemented,
		Code:    "not_implemented",
		Message: "This endpoint is not implemented yet.",
	}
}

func ServiceUnavailable() *APIError {
	return &APIError{
		Status:  http.StatusServiceUnavailable,
		Code:    "service_unavailable",
		Message: "The service is temporarily unavailable.",
	}
}

func Unauthorized(msg string) *APIError {
	return &APIError{
		Status:  http.StatusUnauthorized,
		Code:    "unauthorized",
		Message: msg,
	}
}

func Forbidden(msg string) *APIError {
	return &APIError{
		Status:  http.StatusForbidden,
		Code:    "forbidden",
		Message: msg,
	}
}

func BadRequest(msg string) *APIError {
	return &APIError{
		Status:  http.StatusBadRequest,
		Code:    "bad_request",
		Message: msg,
	}
}

func NotFound(msg string) *APIError {
	return &APIError{
		Status:  http.StatusNotFound,
		Code:    "not_found",
		Message: msg,
	}
}

func Internal(err error) *APIError {
	return &APIError{
		Status:  http.StatusInternalServerError,
		Code:    "internal_error",
		Message: "An unexpected error occurred.",
		Err:     err,
	}
}

// RespondError is the single JSON error shape for the API. Unknown errors are
// intentionally converted to a generic response so implementation details and
// database errors are never sent to clients.
func RespondError(c *gin.Context, err error) {
	apiErr := Internal(err)
	var typedErr *APIError
	if errors.As(err, &typedErr) {
		apiErr = typedErr
	}

	c.AbortWithStatusJSON(apiErr.Status, gin.H{
		"error": gin.H{
			"code":    apiErr.Code,
			"message": apiErr.Message,
		},
		"request_id": RequestID(c),
	})
}

func RequestID(c *gin.Context) string {
	if requestID := c.GetString(RequestIDContextKey); requestID != "" {
		return requestID
	}
	return ""
}
