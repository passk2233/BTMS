package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader(utils.RequestIDHeader)
		if !validRequestID(requestID) {
			requestID = newRequestID()
		}

		c.Set(utils.RequestIDContextKey, requestID)
		c.Header(utils.RequestIDHeader, requestID)
		c.Next()
	}
}

func validRequestID(value string) bool {
	if len(value) == 0 || len(value) > 128 {
		return false
	}
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '-' || char == '_' {
			continue
		}
		return false
	}
	return true
}

func newRequestID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err == nil {
		return hex.EncodeToString(bytes[:])
	}

	// crypto/rand failure is exceptionally rare. Keep a valid, traceable ID so
	// error responses and logs can still be correlated.
	return fmt.Sprintf("fallback-%d", time.Now().UnixNano())
}
