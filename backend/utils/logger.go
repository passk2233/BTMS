package utils

import (
	"fmt"
	"log/slog"
	"os"
)

// NewLogger emits JSON so application and request fields remain queryable in
// Docker, VPS, and hosted log collectors.
func NewLogger(level string) (*slog.Logger, error) {
	var slogLevel slog.Level
	switch level {
	case "debug":
		slogLevel = slog.LevelDebug
	case "info":
		slogLevel = slog.LevelInfo
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		return nil, fmt.Errorf("unsupported log level %q", level)
	}

	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slogLevel})), nil
}
