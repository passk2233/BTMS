-- Local development and test seed data.
--
-- Roles are intentionally the only seed records at this stage. Exam types,
-- stages, evaluation criteria, and rates need their owning tables and approved
-- business rules before they can be safely seeded.

begin;

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

commit;
