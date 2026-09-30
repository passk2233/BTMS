# Service layer

Add domain workflows here: thesis, exam, progress, finance, disbursement,
printing, notification, and file services. Services calculate scores, progress,
fees, payment amounts, and printing costs from persisted data; clients provide
identifiers and inputs, never trusted calculated monetary totals.

Use PostgreSQL `NUMERIC` values and an explicit rounding/currency policy. Do
not introduce floating-point values for money.
