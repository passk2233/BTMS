package routes

import (
	"github.com/btms/backend/handler"
	"github.com/gin-gonic/gin"
)

// Register keeps the HTTP surface visible while implementation proceeds by
// domain. Each unfinished business endpoint consistently returns 501.
func Register(router *gin.Engine, health *handler.HealthHandler) {
	router.GET("/healthz", health.Live)
	router.GET("/readyz", health.Ready)

	api := router.Group("/api")
	stub := handler.NotImplemented()

	// TODO(auth): Do not mount JWT or role middleware until the project has made
	// the required JWKS-versus-legacy-HS256 signing-key decision. No business
	// data is exposed here: every domain route is a 501 placeholder for now.
	registerAuthRoutes(api.Group("/auth"), stub)
	registerUserRoutes(api, stub)
	registerThesisRoutes(api.Group("/theses"), stub)
	registerProgressRoutes(api.Group("/progress"), stub)
	registerExamRoutes(api.Group("/exams"), api.Group("/evaluation"), stub)
	registerFinanceRoutes(api, stub)
	registerPrintingRoutes(api.Group("/printing"), stub)
	registerFileRoutes(api.Group("/files"), stub)
	registerNotificationRoutes(api.Group("/notifications"), stub)
	registerReportRoutes(api.Group("/reports"), stub)
}

func registerAuthRoutes(auth *gin.RouterGroup, stub gin.HandlerFunc) {
	auth.GET("", stub)
}

func registerUserRoutes(api *gin.RouterGroup, stub gin.HandlerFunc) {
	api.GET("/me", stub)

	users := api.Group("/users")
	users.GET("", stub)
	users.POST("", stub)
	users.PUT("/:id", stub)

	students := api.Group("/students")
	students.GET("", stub)
	students.GET("/:id", stub)

	teachers := api.Group("/teachers")
	teachers.GET("", stub)
	teachers.GET("/:id", stub)
}

func registerThesisRoutes(theses *gin.RouterGroup, stub gin.HandlerFunc) {
	theses.GET("", stub)
	theses.POST("", stub)
	theses.GET("/:id", stub)
	theses.PUT("/:id", stub)
	theses.POST("/:id/submit", stub)
	theses.POST("/:id/review", stub)
	theses.POST("/:id/approve", stub)
	theses.POST("/:id/revision", stub)
}

func registerProgressRoutes(progress *gin.RouterGroup, stub gin.HandlerFunc) {
	progress.GET("", stub)
	progress.GET("/theses/:id", stub)
	progress.POST("/theses/:id/recalculate", stub)
}

func registerExamRoutes(exams, evaluation *gin.RouterGroup, stub gin.HandlerFunc) {
	exams.GET("", stub)
	exams.POST("", stub)
	exams.GET("/:id", stub)
	exams.PUT("/:id", stub)
	exams.POST("/:id/schedule", stub)
	exams.POST("/:id/calculate-result", stub)

	evaluation.GET("/criteria", stub)
	evaluation.POST("/criteria", stub)
	evaluation.GET("/scores", stub)
	evaluation.POST("/scores", stub)
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
