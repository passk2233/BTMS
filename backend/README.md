# BTMS Go API

The backend is a Go/Gin foundation for the Bachelor's Thesis Examination &
Financial Management System. PostgreSQL migrations in `../supabase/migrations`
are the database source of truth; sqlc produces Go types and queries from that
schema and the SQL in `db/queries/`.

## Layout

```text
cmd/server/      HTTP process startup and graceful shutdown
config/          validated environment configuration
db/              pgxpool setup, sqlc queries, generated sqlc output
handler/         transport handlers
middleware/      request ID, structured logging, recovery, CORS
repository/      future sqlc-backed persistence adapters
service/         future business workflows and transactions
routes/          HTTP route registration
storage/         future Supabase Storage adapter
utils/           logger and consistent JSON error responses
```

## Run locally

The API validates its environment and verifies PostgreSQL connectivity before
it starts. Set a real `DATABASE_URL` for the Supabase database or selected
pooler mode before running it.

```powershell
cd backend
$env:DATABASE_URL = "postgresql://postgres:<password>@<host>:6543/postgres?sslmode=require"
go mod download
go run ./cmd/server
```

Use `.env.example` as the complete list of supported configuration values. The
application intentionally does not load `.env` files itself; set variables in
your deployment environment or pass an env file to Docker.

```powershell
docker build -t btms-api ./backend
docker run --rm --env-file ./backend/.env -p 8080:8080 btms-api
```

Once running, `GET /healthz` reports process liveness and `GET /readyz` also
checks PostgreSQL. Planned `/api/...` routes are registered as `501 Not
Implemented` placeholders so frontend work can target stable paths without
exposing unfinished business logic.

## sqlc

After migrations exist or change, generate the database package from this
directory:

```powershell
sqlc generate
```

Do not edit files under `db/sqlc/` by hand. For monetary columns, keep PostgreSQL
`NUMERIC` types and choose a Go decimal/rounding policy deliberately rather than
using `float32` or `float64`.

## Authentication decision required

JWT middleware is deliberately not implemented. Before adding protected
handlers, determine whether the Supabase project uses asymmetric signing keys
(verify with cached JWKS) or legacy HS256 (use its appropriate verification
flow). The two modes must not be treated as interchangeable. Then add signature,
issuer, expiry, role, and permission checks in `middleware/` and mount them in
`routes/`.

## Pooler note

The pool starts at `MaxConns=10` and `MinConns=2`; tune these values to workload
and Supabase quota. `DATABASE_SIMPLE_PROTOCOL=true` is available only for a
tested transaction-pooler setup where prepared statements are incompatible.
