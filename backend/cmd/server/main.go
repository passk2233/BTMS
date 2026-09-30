package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/btms/backend/config"
	"github.com/btms/backend/db"
	"github.com/btms/backend/handler"
	"github.com/btms/backend/middleware"
	"github.com/btms/backend/routes"
	"github.com/btms/backend/utils"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load configuration: %w", err)
	}

	logger, err := utils.NewLogger(cfg.LogLevel)
	if err != nil {
		return fmt.Errorf("create logger: %w", err)
	}

	if cfg.Environment != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	connectCtx, cancelConnect := context.WithTimeout(context.Background(), cfg.Database.ConnectTimeout)
	defer cancelConnect()

	pool, err := db.NewPool(connectCtx, cfg.Database)
	if err != nil {
		return fmt.Errorf("connect to database: %w", err)
	}
	defer pool.Close()

	router := gin.New()
	router.Use(
		middleware.RequestID(),
		middleware.RequestLogger(logger),
		middleware.Recovery(logger),
		middleware.CORS(cfg.CORSAllowedOrigins),
	)

	routes.Register(router, handler.NewHealthHandler(pool, cfg.HealthCheckTimeout))

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("http server starting", "environment", cfg.Environment, "address", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(signals)

	select {
	case err := <-serverErrors:
		return fmt.Errorf("serve http: %w", err)
	case sig := <-signals:
		logger.Info("shutdown signal received", "signal", sig.String())
	}

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancelShutdown()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("graceful shutdown: %w", err)
	}

	logger.Info("http server stopped")
	return nil
}
