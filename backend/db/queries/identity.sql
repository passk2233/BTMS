-- Identity and role queries for sqlc

-- name: GetProfileByID :one
SELECT id, display_name, created_at, updated_at
FROM public.profiles
WHERE id = $1;

-- name: GetUserRoles :many
SELECT ur.role_code, r.name AS role_name, ur.assigned_at, ur.assigned_by
FROM public.user_roles ur
JOIN public.roles r ON ur.role_code = r.code
WHERE ur.profile_id = $1
ORDER BY ur.role_code;

-- name: ListRoles :many
SELECT code, name, description, created_at
FROM public.roles
ORDER BY code;

-- name: UpdateProfileDisplayName :one
UPDATE public.profiles
SET display_name = $2, updated_at = now()
WHERE id = $1
RETURNING id, display_name, created_at, updated_at;

-- name: AssignUserRole :exec
INSERT INTO public.user_roles (profile_id, role_code, assigned_by)
VALUES ($1, $2, $3)
ON CONFLICT (profile_id, role_code) DO NOTHING;

-- name: RemoveUserRole :exec
DELETE FROM public.user_roles
WHERE profile_id = $1 AND role_code = $2;

-- name: ListProfilesWithRoles :many
SELECT 
    p.id, 
    p.display_name, 
    p.created_at, 
    p.updated_at,
    COALESCE(array_agg(ur.role_code) FILTER (WHERE ur.role_code IS NOT NULL), '{}')::text[] AS roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.profile_id
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;
