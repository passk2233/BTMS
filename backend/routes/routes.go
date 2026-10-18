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
	Finance      *handler.FinanceHandler
	Printing     *handler.PrintingHandler
	File         *handler.FileHandler
	Notification *handler.NotificationHandler
	Report       *handler.ReportHandler
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
	registerProgressRoutes(protected.Group("/progress"), deps.Thesis)
	registerExamRoutes(protected.Group("/exams"), protected.Group("/evaluation"), deps.Exam)
	registerFinanceRoutes(protected, deps.Finance)
	registerPrintingRoutes(protected.Group("/printing"), deps.Printing)
	registerFileRoutes(protected.Group("/files"), deps.File)
	registerNotificationRoutes(protected.Group("/notifications"), deps.Notification)
	registerReportRoutes(protected.Group("/reports"), deps.Report)
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
	theses.GET("/categories", h.ListCategories)
	theses.GET("/stages", h.ListStages)
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

func registerProgressRoutes(progress *gin.RouterGroup, h *handler.ThesisHandler) {
	progress.GET("/stages", h.ListStages)
}

func registerExamRoutes(exams, evaluation *gin.RouterGroup, h *handler.ExamHandler) {
	// Round management
	exams.GET("/rounds", h.ListRounds)
	exams.POST("/rounds", h.CreateRound)
	exams.GET("/rounds/:id", h.GetRound)
	exams.POST("/rounds/:id/close", h.CloseRound)
	exams.GET("/rounds/:id/rooms", h.ListRoundRooms)
	exams.POST("/rounds/:id/rooms", h.AssignRoundRoom)
	exams.GET("/rounds/:id/committee-fees", h.CalculateRoundCommitteeFees)

	// Exam instances
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

func registerFinanceRoutes(api *gin.RouterGroup, h *handler.FinanceHandler) {
	payments := api.Group("/payments")
	payments.GET("", h.ListPayments)
	payments.POST("", h.CreatePayment)
	payments.POST("/:id/verify", h.VerifyPayment)

	fees := api.Group("/fees")
	fees.GET("", h.ListFeeRates)
	fees.GET("/committee", h.ListCommitteeRates)

	disbursements := api.Group("/disbursements")
	disbursements.GET("", h.ListDisbursements)
	disbursements.GET("/wage-period", h.GetStaffWagePeriod)
	disbursements.PUT("/:id/status", h.UpdatePayoutStatus)
}

func registerPrintingRoutes(printing *gin.RouterGroup, h *handler.PrintingHandler) {
	printing.GET("", h.ListOrders)
	printing.POST("", h.CreateOrder)
	printing.GET("/:id", h.GetOrder)
	printing.PUT("/:id/stage", h.UpdateStage)
	printing.POST("/calculate-cost", h.CalculateCost)
}

func registerFileRoutes(files *gin.RouterGroup, h *handler.FileHandler) {
	files.POST("", h.CreateFile)
	files.GET("/thesis/:thesisId", h.ListFilesByThesis)
	files.POST("/revisions", h.CreateRevision)
	files.GET("/revisions/thesis/:thesisId", h.ListRevisionsByThesis)
	files.POST("/revisions/:id/review", h.ReviewRevision)
}

func registerNotificationRoutes(notifications *gin.RouterGroup, h *handler.NotificationHandler) {
	notifications.GET("", h.List)
	notifications.POST("/:id/read", h.MarkRead)
	notifications.POST("/read-all", h.MarkAllRead)
}

func registerReportRoutes(reports *gin.RouterGroup, h *handler.ReportHandler) {
	reports.GET("/dashboard", h.GetDashboardOverview)
	reports.GET("/:name", h.GetReportByName)
}
