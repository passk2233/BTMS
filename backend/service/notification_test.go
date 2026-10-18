package service

import (
	"context"
	"testing"
)

func TestNotificationLifecycle(t *testing.T) {
	svc := NewNotificationService()
	ctx := context.Background()

	// Initial check
	notifs, unread, err := svc.ListNotifications(ctx, "user-123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(notifs) == 0 {
		t.Errorf("expected initial notifications")
	}

	initialUnread := unread

	// Push new notification
	item := svc.PushNotification(ctx, "user-123", "Test Title", "Test Message", NotifyThesisApproved, "/thesis")
	if item.IsRead {
		t.Errorf("expected new notification to be unread")
	}

	// Verify unread increment
	_, newUnread, _ := svc.ListNotifications(ctx, "user-123")
	if newUnread != initialUnread+1 {
		t.Errorf("expected unread count %d, got %d", initialUnread+1, newUnread)
	}

	// Mark as read
	if err := svc.MarkAsRead(ctx, item.ID); err != nil {
		t.Fatalf("failed to mark as read: %v", err)
	}

	// Mark all as read
	if err := svc.MarkAllAsRead(ctx, "user-123"); err != nil {
		t.Fatalf("failed to mark all as read: %v", err)
	}

	_, finalUnread, _ := svc.ListNotifications(ctx, "user-123")
	if finalUnread != 0 {
		t.Errorf("expected 0 unread after MarkAllAsRead, got %d", finalUnread)
	}
}
