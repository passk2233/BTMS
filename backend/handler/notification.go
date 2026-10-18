package handler

import (
	"net/http"

	"github.com/btms/backend/middleware"
	"github.com/btms/backend/service"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	svc *service.NotificationService
}

func NewNotificationHandler(svc *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	notifs, unread, err := h.svc.ListNotifications(c.Request.Context(), userID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":         notifs,
		"unread_count": unread,
	})
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.MarkAsRead(c.Request.Context(), id); err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read."})
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if err := h.svc.MarkAllAsRead(c.Request.Context(), userID); err != nil {
		utils.RespondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read."})
}
