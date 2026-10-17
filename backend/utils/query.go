package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// QueryInt reads a query-string parameter as an integer, returning defaultVal
// when the parameter is absent, empty, or not a valid non-negative integer.
func QueryInt(c *gin.Context, key string, defaultVal int) int {
	raw := c.Query(key)
	if raw == "" {
		return defaultVal
	}
	val, err := strconv.Atoi(raw)
	if err != nil || val < 0 {
		return defaultVal
	}
	return val
}
