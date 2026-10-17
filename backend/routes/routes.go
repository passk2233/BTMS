package routes

import (
	"log/slog"

	"github.com/btms/backend/db/sqlc"
	"github.com/btms/backend/handler"
	"github.com/btms/backend/middleware"
	"github.com/gin-gonic/gin"
)

// Deps holds the fully-initialised dependencies required by the route tree.
type Deps struct {
	Health       *handler.HealthHandler
	User         *handler.UserHandler
	Thesis       *handler.ThesisHandler
	Exam         *handler.ExamHandler
	Academic     *handler.AcademicHandler
	Queries      *sqlc.Queries
	JWKSProvider *middleware.JWKSProvider
	Issuer       string
	Logger       *slog.Logger
}

// Register mounts all HTTP routes onto the router. Health endpoints are always
// public. Auth-related endpoints are public stubs. Every other API route
// requires a valid Supabase JWT, and admin routes additionally require the
// ADMIN role.
func Register(router *gin.Engine, deps *Deps) {
	// --- Operational health (always public) ---
	router.GET("/healthz", deps.Health.Live)
	router.GET("/readyz", deps.Health.Ready)

	api := router.Group("/api")
	stub := handler.NotImplemented()

	// --- Public routes (no JWT required) ---
	// Authentication is handled entirely by Supabase on the client side.
	// These stubs remain as placeholders for future server-side auth endpoints.
	registerAuthRoutes(api.Group("/auth"), stub)

	// --- Protected routes (valid JWT required) ---
	jwtAuth := middleware.JWTAuth(deps.JWKSProvider, deps.Issuer, deps.Logger)
	protected := api.Group("", jwtAuth)

	// Current user
	protected.GET("/me", deps.User.Me)

	// Admin user & role management
	registerUserRoutes(protected, deps.User, deps.Queries)

	// Student management
	students := protected.Group("/students")
	students.GET("", deps.Academic.ListStudents)
	students.POST("", deps.Academic.CreateStudent)
	students.GET("/:id", deps.Academic.GetStudent)
	students.PUT("/:id", deps.Academic.UpdateStudent)

	// Teacher, Adviser & Committee management
	teachers := protected.Group("/teachers")
	teachers.GET("", deps.Academic.ListTeachers)
	teachers.POST("", deps.Academic.CreateTeacher)
	teachers.GET("/:id", deps.Academic.GetTeacher)
	teachers.PUT("/:id", deps.Academic.UpdateTeacher)
	teachers.GET("/:id/advising", deps.Academic.GetTeacherAdvising)
	teachers.GET("/:id/committees", deps.Academic.GetTeacherCommittees)

	// Domain routes — all require authentication
	registerThesisRoutes(protected.Group("/theses"), deps.Thesis)
	registerProgressRoutes(protected.Group("/progress"), stub)
	registerExamRoutes(protected.Group("/exams"), protected.Group("/evaluation"), deps.Exam)
	registerFinanceRoutes(protected, stub)
	registerPrintingRoutes(protected.Group("/printing"), stub)
	registerFileRoutes(protected.Group("/files"), stub)
	registerNotificationRoutes(protected.Group("/notifications"), stub)
	registerReportRoutes(protected.Group("/reports"), stub)
}

func registerAuthRoutes(auth *gin.RouterGroup, stub gin.HandlerFunc) {
	auth.GET("", stub)
}

func registerUserRoutes(protected *gin.RouterGroup, userHandler *handler.UserHandler, queries *sqlc.Queries) {
	adminOnly := middleware.RequireRole(queries, "ADMIN")
	users := protected.Group("/users", adminOnly)
	users.GET("", userHandler.ListUsers)
	users.POST("/:id/roles", userHandler.AssignRole)
	users.DELETE("/:id/roles/:code", userHandler.RemoveRole)
}

func registerThesisRoutes(theses *gin.RouterGroup, h *handler.ThesisHandler) {
	theses.GET("", h.List)
	theses.POST("", h.Create)
	theses.GET("/mine", h.ListMine)
	theses.GET("/counts", h.CountByStatus)
	theses.GET("/:id", h.Get)
	theses.PUT("/:id", h.Update)
	theses.POST("/:id/submit", h.Submit)
	theses.POST("/:id/review", h.Review)
	theses.POST("/:id/approve", h.Approve)
	theses.POST("/:id/revision", h.Revision)
	theses.POST("/:id/members", h.AddMember)
	theses.DELETE("/:id/members/:studentId", h.RemoveMember)
	theses.POST("/:id/advisors", h.AssignAdvisor)
	theses.DELETE("/:id/advisors/:teacherId", h.RemoveAdvisor)
}

func registerProgressRoutes(progress *gin.RouterGroup, stub gin.HandlerFunc) {
	progress.GET("", stub)
	progress.GET("/theses/:id", stub)
	progress.POST("/theses/:id/recalculate", stub)
}

func registerExamRoutes(exams, evaluation *gin.RouterGroup, h *handler.ExamHandler) {
	exams.GET("", h.List)
	exams.POST("", h.Schedule)
	exams.GET("/:id", h.Get)
	exams.POST("/:id/schedule", h.TransitionStatus)
	exams.GET("/:id/calculate-result", h.CalculateResult)
	exams.POST("/:id/calculate-result", h.FinalizeResult)
	exams.POST("/:id/committee", h.AssignCommittee)
	exams.DELETE("/:id/committee/:teacherId", h.RemoveCommittee)

	evaluation.GET("/criteria", h.ListCriteria)
	evaluation.POST("/scores", h.SubmitScore)
}

func registerFinanceRoutes(api *gin.RouterGroup, stub gin.HandlerFunc) {
	paymentRoutes(api.Group("/payments"), stub)
	feeRoutes(api.Group("/fees"), stub)
	disbursementRoutes(api.Group("/disbursements"), stub)
}

func paymentRoutes(payments *gin.RouterGroup, stub gin.HandlerFunc) {
	payments.GET("", stub)
	payments.POST("", stub)
	payments.GET("/:id", stub)
	payments.PUT("/:id", stub)
	payments.POST("/:id/verify", stub)
}

func feeRoutes(fees *gin.RouterGroup, stub gin.HandlerFunc) {
	fees.GET("", stub)
	fees.POST("", stub)
	fees.PUT("/:id", stub)
}

func disbursementRoutes(disbursements *gin.RouterGroup, stub gin.HandlerFunc) {
	disbursements.GET("", stub)
	disbursements.POST("", stub)
	disbursements.GET("/:id", stub)
	disbursements.PUT("/:id", stub)
}

func registerPrintingRoutes(printing *gin.RouterGroup, stub gin.HandlerFunc) {
	printing.GET("", stub)
	printing.POST("", stub)
	printing.GET("/:id", stub)
	printing.PUT("/:id", stub)
	printing.POST("/:id/calculate-cost", stub)
}

func registerFileRoutes(files *gin.RouterGroup, stub gin.HandlerFunc) {
	files.GET("", stub)
	files.POST("", stub)
	files.GET("/:id", stub)
}

func registerNotificationRoutes(notifications *gin.RouterGroup, stub gin.HandlerFunc) {
	notifications.GET("", stub)
	notifications.POST("/:id/read", stub)
}

func registerReportRoutes(reports *gin.RouterGroup, stub gin.HandlerFunc) {
	reports.GET("", stub)
	reports.GET("/:name", stub)
}
