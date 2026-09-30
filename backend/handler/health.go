package handler

import (
	"context"
	"time"

	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
	pool    *pgxpool.Pool
	timeout time.Duration
}

func NewHealthHandler(pool *pgxpool.Pool, timeout time.Duration) *HealthHandler {
	return &HealthHandler{pool: pool, timeout: timeout}
}

// Live reports that the HTTP process can receive requests. It deliberately does
// not depend on PostgreSQL, so an orchestrator can distinguish a crashed server
// from a temporarily unavailable dependency.
func (h *HealthHandler) Live(c *gin.Context) {
	c.JSON(200, gin.H{"status": "ok"})
}

// Ready reports whether the server can currently reach PostgreSQL.
func (h *HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), h.timeout)
	defer cancel()

	if err := h.pool.Ping(ctx); err != nil {
		utils.RespondError(c, utils.ServiceUnavailable())
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
		"checks": gin.H{"database": "ok"},
	})
}
