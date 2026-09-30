# Repository layer

Repositories will be thin adapters around generated `db/sqlc` queries. Keep
database-specific mapping here; services own business rules. Multi-table
financial workflows must accept a `pgx.Tx` (or coordinate one) so payment,
disbursement, financial transaction, and audit-log writes commit or roll back
together.
