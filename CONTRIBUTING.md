# Contribution rules

## Schema and generated code

- Create a new timestamped migration for every database change. Do not edit a deployed migration or change production data by hand.
- Treat `frontend/src/types/database.types.ts` and `backend/db/sqlc/*.go` as generated files. Change the schema or SQL sources, then regenerate.
- Keep every table that the frontend accesses directly protected by RLS and test each policy with the relevant role.

## Business and finance rules

- The frontend sends identifiers and intent, never calculated monetary totals, final scores, or derived workflow state.
- Store money in `NUMERIC`, define a currency and rounding rule, and avoid floating-point calculations.
- Put every financial workflow in one database transaction. Write an `audit_logs` record for financial operations and significant state transitions.

## API and authentication rules

- Go owns authorization for all API routes. Supabase RLS is the data boundary for direct frontend access, not a replacement for API authorization.
- Validate JWT signature, issuer, expiry, subject, and permissions. Use cached JWKS only after confirming asymmetric signing keys are enabled; use the approved legacy path for HS256 projects.
- Keep secrets in local environment files or the deployment secret store, never source control.
