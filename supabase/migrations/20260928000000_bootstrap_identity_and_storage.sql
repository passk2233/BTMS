-- BTMS database bootstrap.
--
-- This migration establishes only the cross-cutting foundation shared by all
-- domains. Thesis, examination, progress, finance, and printing tables belong
-- in their own reviewed migrations; see migrations/MIGRATION_INDEX.md.

begin;

-- Available to later UUID-based domain migrations without coupling this
-- bootstrap to a speculative domain schema.
create extension if not exists pgcrypto with schema extensions;

-- Trigger functions live outside the API-exposed public schema.
create schema if not exists private;
revoke all on schema private from public;

create table public.roles (
  code text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint roles_code_format check (code = upper(code) and code ~ '^[A-Z][A-Z_]*$'),
  constraint roles_name_not_blank check (btrim(name) <> '')
);

comment on table public.roles is
  'Authoritative, system-defined BTMS role catalogue. Role assignment is performed only by the Go API.';

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 160
  )
);

comment on table public.profiles is
  'Application profile keyed by auth.users.id. Authentication credentials and email remain owned by Supabase Auth.';

create table public.user_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_code text not null references public.roles (code) on update cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users (id) on delete set null,
  primary key (profile_id, role_code)
);

comment on table public.user_roles is
  'Many-to-many role assignments. Do not grant client-side INSERT, UPDATE, or DELETE access.';

create index user_roles_by_role_idx on public.user_roles (role_code, profile_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  request_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  old_values jsonb not null default '{}'::jsonb,
  new_values jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  constraint audit_logs_action_not_blank check (btrim(action) <> ''),
  constraint audit_logs_old_values_object check (jsonb_typeof(old_values) = 'object'),
  constraint audit_logs_new_values_object check (jsonb_typeof(new_values) = 'object'),
  constraint audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.audit_logs is
  'Append-only application audit trail. The Go API must insert an event in the same transaction as every significant status transition.';

create index audit_logs_by_actor_idx on public.audit_logs (actor_id, occurred_at desc);
create index audit_logs_by_entity_idx on public.audit_logs (entity_type, entity_id, occurred_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

-- Every Auth user receives a profile, but no role is assigned implicitly.
-- An implicit default role would be a privilege-escalation decision, so account
-- provisioning must assign roles explicitly through the Go API.
create or replace function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.create_profile_for_auth_user() from public;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.create_profile_for_auth_user() to supabase_auth_admin;

create trigger auth_user_created_create_profile
after insert on auth.users
for each row execute function private.create_profile_for_auth_user();

-- Safe when this is introduced to a development project that already has Auth
-- users. It deliberately does not infer or grant any role to those users.
insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;

-- System roles from the implementation plan. These are also repeated
-- idempotently in seed.sql so local resets and test setup remain explicit.
insert into public.roles (code, name, description)
values
  ('ADMIN', 'Administrator', 'System administration and user management'),
  ('STAFF', 'Academic Staff', 'Thesis workflow administration'),
  ('STUDENT', 'Student', 'Thesis group member and submitter'),
  ('ADVISOR', 'Advisor', 'Assigned thesis advisor'),
  ('COMMITTEE', 'Committee Member', 'Assigned examination committee member'),
  ('FINANCE', 'Finance Officer', 'Financial verification and disbursement'),
  ('PRINTING', 'Printing Officer', 'Printing order processing')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

-- Direct browser reads are deliberately narrow. The Go API owns all workflow
-- and financial writes; service credentials must never reach the browser.
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to authenticated;
grant select on public.roles to authenticated;
grant select on public.profiles to authenticated;
grant select on public.user_roles to authenticated;

create policy roles_select_authenticated
on public.roles
for select
to authenticated
using (true);

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = profile_id);

-- audit_logs intentionally has no client policy or table grant. It is written
-- and read through the Go API / privileged server database connection only.

-- All buckets are private. Object names must start with the authenticated
-- user's UUID, for example: <auth.uid()>/<opaque-file-id>/<filename>. The
-- future thesis/exam/finance migrations will add relationship-aware read
-- policies for advisors, committee members, finance, and printing staff.
insert into storage.buckets (id, name, public)
values
  ('thesis-files', 'thesis-files', false),
  ('exam-documents', 'exam-documents', false),
  ('payment-proofs', 'payment-proofs', false),
  ('financial-documents', 'financial-documents', false)
on conflict (id) do nothing;

--alter table storage.objects enable row level security;

create policy btms_storage_insert_own_prefix
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('thesis-files', 'exam-documents', 'payment-proofs', 'financial-documents')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy btms_storage_select_own_prefix
on storage.objects
for select
to authenticated
using (
  bucket_id in ('thesis-files', 'exam-documents', 'payment-proofs', 'financial-documents')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

commit;
