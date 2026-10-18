package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/btms/backend/utils"
)

type NotificationType string

const (
	NotifyThesisSubmitted  NotificationType = "THESIS_SUBMITTED"
	NotifyThesisApproved   NotificationType = "THESIS_APPROVED"
	NotifyExamScheduled    NotificationType = "EXAM_SCHEDULED"
	NotifyScoreRecorded    NotificationType = "SCORE_RECORDED"
	NotifyPaymentVerified  NotificationType = "PAYMENT_VERIFIED"
	NotifyRevisionRequired NotificationType = "REVISION_REQUIRED"
	NotifyPrintReady       NotificationType = "PRINT_READY"
)

type NotificationItem struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Type      string `json:"type"`
	Link      string `json:"link,omitempty"`
	IsRead    bool   `json:"is_read"`
	CreatedAt string `json:"created_at"`
}

type NotificationService struct {
	mu            sync.RWMutex
	notifications []NotificationItem
}

func NewNotificationService() *NotificationService {
	// Initialize with realistic initial notifications
	return &NotificationService{
		notifications: []NotificationItem{
			{
				ID:        "NOTIF-001",
				UserID:    "all",
				Title:     "ປະກາດຕາຕະລາງສອບປ້ອງກັນຫົວບົດ ຊຸດທີ່ 1",
				Message:   "ຕາຕະລາງສອບປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1 (Proposal Defense Round 1) ໄດ້ຖືກອະນຸມັດ ແລະ ປະກາດແລ້ວ.",
				Type:      string(NotifyExamScheduled),
				Link:      "/examination",
				IsRead:    false,
				CreatedAt: "2026-10-02 09:30",
			},
			{
				ID:        "NOTIF-002",
				UserID:    "all",
				Title:     "ກວດສອບສະລິບໂອນເງິນສຳເລັດ",
				Message:   "ສະລິບໂອນເງິນຄ່າທຳນຽມສອບປ້ອງກັນກຸ່ມ CS-2026-001 ໄດ້ຮັບການຢືນຢັນ ແລະ ອອກໃບຮັບເງິນແລ້ວ.",
				Type:      string(NotifyPaymentVerified),
				Link:      "/finance",
				IsRead:    true,
				CreatedAt: "2026-10-01 16:45",
			},
			{
				ID:        "NOTIF-003",
				UserID:    "all",
				Title:     "ເຫຼັ້ມບົດພ້ອມຮັບແລ້ວ (Printing Ready)",
				Message:   "ຄຳສັ່ງພິມ PR-2026-003 (5 ເຫຼັ້ມ, ປົກແຂງປ້ຳຄຳ) ສຳເລັດຮູບເຫຼັ້ມແລ້ວ ພ້ອມມອບສົ່ງ.",
				Type:      string(NotifyPrintReady),
				Link:      "/printing",
				IsRead:    false,
				CreatedAt: "2026-09-29 15:10",
			},
		},
	}
}

func (s *NotificationService) ListNotifications(ctx context.Context, userID string) ([]NotificationItem, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var userNotifs []NotificationItem
	unreadCount := 0

	for _, n := range s.notifications {
		if n.UserID == "all" || n.UserID == userID {
			userNotifs = append(userNotifs, n)
			if !n.IsRead {
				unreadCount++
			}
		}
	}

	return userNotifs, unreadCount, nil
}

func (s *NotificationService) MarkAsRead(ctx context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.notifications {
		if s.notifications[i].ID == id {
			s.notifications[i].IsRead = true
			return nil
		}
	}
	return utils.NotFound(fmt.Sprintf("Notification %q not found.", id))
}

func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.notifications {
		if s.notifications[i].UserID == "all" || s.notifications[i].UserID == userID {
			s.notifications[i].IsRead = true
		}
	}
	return nil
}

func (s *NotificationService) PushNotification(ctx context.Context, userID string, title, message string, notifType NotificationType, link string) *NotificationItem {
	s.mu.Lock()
	defer s.mu.Unlock()

	newID := fmt.Sprintf("NOTIF-%03d", len(s.notifications)+1)
	item := NotificationItem{
		ID:        newID,
		UserID:    userID,
		Title:     title,
		Message:   message,
		Type:      string(notifType),
		Link:      link,
		IsRead:    false,
		CreatedAt: time.Now().Format("2006-01-02 15:04"),
	}

	s.notifications = append([]NotificationItem{item}, s.notifications...)
	return &item
}
