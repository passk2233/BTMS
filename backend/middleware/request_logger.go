package middleware

import (
	"log/slog"
	"time"

	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		started := time.Now()
		c.Next()

		attributes := []any{
			"request_id", utils.RequestID(c),
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"latency_ms", time.Since(started).Milliseconds(),
			"response_bytes", c.Writer.Size(),
			"client_ip", c.ClientIP(),
		}

		if c.Writer.Status() >= 500 {
			logger.Error("http request", attributes...)
			return
		}
		logger.Info("http request", attributes...)
	}
}
