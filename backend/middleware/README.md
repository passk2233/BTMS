# Middleware boundary

The foundation includes request IDs, structured request logs, panic recovery,
and CORS. JWT and role middleware are intentionally absent.

Before any protected domain handler is implemented, choose the Supabase signing
mode: asymmetric keys verified through cached JWKS, or the legacy HS256 flow.
Do not add a JWKS verifier to a legacy HS256 project, and do not accept JWT
claims without signature, issuer, and expiry validation. After that decision,
add authentication and permission middleware here and mount it in `routes/`.
