# Generated sqlc package

Run `sqlc generate` from `backend/` after changing PostgreSQL migrations or files
in `db/queries/`. The generated Go files in this directory must not be edited by
hand; the schema and SQL queries are the source of truth.

`DatabaseNow` in `../queries/health.sql` is a small starter query that confirms
the sqlc pipeline without duplicating schema definitions in the Go API.
