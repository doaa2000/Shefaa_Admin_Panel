-- =============================================================================
-- SECURITY FIX — replaces the wide-open policies created by 001_admin_integration.sql
--
-- 001 created, on profiles / "Doctors" / specialties / "Governorates" / "Cities"
-- / "Clinics":
--
--     create policy admin_manage on <table>
--       for all to authenticated using (true) with check (true);
--
-- `to authenticated` means EVERY signed-in user, and the patient app signs
-- every patient in. So any patient could read every other patient's profile
-- (name, phone, gender, birth date) and insert, update or delete any doctor,
-- specialty or clinic. This migration drops those policies and replaces them
-- with least-privilege ones.
--
-- Run this AFTER 001. It is idempotent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Who is an admin?  Membership in public.admins — nothing else.
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select to authenticated using (id = auth.uid());

-- SECURITY DEFINER so the lookup itself is not filtered by admins' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Drop the permissive policies from 001.
-- -----------------------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'specialties', '"Doctors"', '"Governorates"', '"Cities"', '"Clinics"', 'profiles'
  ]
  loop
    execute format('drop policy if exists admin_manage on public.%s;', tbl);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Reference data — every signed-in user may READ; only admins may WRITE.
--    (specialties, doctors, the location tree, and the bookable slots)
-- -----------------------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'specialties', '"Doctors"', '"Governorates"', '"Cities"', '"Clinics"',
    'doctor_availability'
  ]
  loop
    execute format('alter table public.%s enable row level security;', tbl);

    execute format('drop policy if exists ref_read_all on public.%s;', tbl);
    execute format(
      'create policy ref_read_all on public.%s
         for select to authenticated using (true);', tbl);

    execute format('drop policy if exists ref_admin_write on public.%s;', tbl);
    execute format(
      'create policy ref_admin_write on public.%s
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin());', tbl);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 4. profiles — a patient sees and edits ONLY their own row. Admins see all.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Deleting a patient is an admin action only.
drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. bookings — a patient sees and creates only their own.
--    Update is limited to their own row (so "cancel my booking" works);
--    deletes are admin-only so history is never silently destroyed.
-- -----------------------------------------------------------------------------
alter table public.bookings enable row level security;

drop policy if exists bookings_select_own on public.bookings;
create policy bookings_select_own on public.bookings
  for select to authenticated
  using (patient_id = auth.uid() or public.is_admin());

drop policy if exists bookings_insert_own on public.bookings;
create policy bookings_insert_own on public.bookings
  for insert to authenticated
  with check (patient_id = auth.uid());

drop policy if exists bookings_update_own on public.bookings;
create policy bookings_update_own on public.bookings
  for update to authenticated
  using (patient_id = auth.uid() or public.is_admin())
  with check (patient_id = auth.uid() or public.is_admin());

drop policy if exists bookings_delete_admin on public.bookings;
create policy bookings_delete_admin on public.bookings
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. payments — a patient sees only their own.
--
--    NOTE: the insert policy below is a STOPGAP. The app still creates the
--    payment row itself with status 'paid' and a client-supplied amount, so a
--    patient can still book for any price they like. The real fix is to move
--    booking + payment creation into an Edge Function (service role) and then
--    drop this insert policy entirely. Tracked as the next task.
-- -----------------------------------------------------------------------------
alter table public.payments enable row level security;

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select to authenticated
  using (patient_id = auth.uid() or public.is_admin());

drop policy if exists payments_insert_own on public.payments;
create policy payments_insert_own on public.payments
  for insert to authenticated
  with check (patient_id = auth.uid());

drop policy if exists payments_write_admin on public.payments;
create policy payments_write_admin on public.payments
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists payments_delete_admin on public.payments;
create policy payments_delete_admin on public.payments
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. Promote your first admin (run once, by hand, with your own user id):
--
--     insert into public.admins (id, name)
--     select id, 'Owner' from auth.users where email = 'you@example.com'
--     on conflict (id) do nothing;
--
-- Until you do this, the admin panel will read empty lists — that is the
-- policies working correctly, not a bug.
-- -----------------------------------------------------------------------------
