package handler

import (
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

// NotImplemented marks planned routes without exposing unfinished business
// logic or pretending authentication is already configured.
func NotImplemented() gin.HandlerFunc {
	return func(c *gin.Context) {
		utils.RespondError(c, utils.NotImplemented())
	}
}
