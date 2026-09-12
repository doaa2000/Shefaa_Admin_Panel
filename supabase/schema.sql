-- ############################################################################
-- ##  DO NOT RUN THIS FILE AGAINST THE SHEFAA PROJECT.                      ##
-- ##                                                                        ##
-- ##  This is a GREENFIELD schema written before the admin panel was wired  ##
-- ##  to the real database. It does NOT describe the live Shefaa schema:    ##
-- ##                                                                        ##
-- ##      this file          live database                                  ##
-- ##      ----------------   ----------------                              ##
-- ##      appointments       bookings                                       ##
-- ##      patients           profiles                                       ##
-- ##      doctors            "Doctors"                                      ##
-- ##      specializations    specialties                                    ##
-- ##      uuid keys          bigint keys                                    ##
-- ##                                                                        ##
-- ##  Running it creates a second, parallel set of tables that nothing      ##
-- ##  reads, while the app keeps using the originals.                       ##
-- ##                                                                        ##
-- ##  The live schema lives in Shefaa/supabase/migrations/0000_base_schema.sql
-- ##  and is adapted for the admin panel by the migrations/ folder here.    ##
-- ##  Kept only as reference for a possible future rebuild.                 ##
-- ############################################################################

-- ============================================================
-- Shefaa Healthcare Admin — PostgreSQL / Supabase schema
-- Relationships · constraints · indexes · RLS · realtime
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Enums -------------------------------------------
do $$ begin
  create type doctor_status as enum ('active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type patient_status as enum ('active', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('paid', 'pending', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

-- ---------- RBAC: roles & permissions -----------------------
create table if not exists roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,         -- e.g. 'doctors.write'
  description text
);

create table if not exists role_permissions (
  role_id       uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ---------- Admins (linked to auth.users) -------------------
create table if not exists admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  name_en    text not null,
  name_ar    text not null,
  role       text not null default 'System Administrator',
  role_id    uuid references roles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Profiles (generic user profile) -----------------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name_en    text,
  name_ar    text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- Location hierarchy ------------------------------
create table if not exists governorates (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null,
  name_ar    text not null,
  created_at timestamptz not null default now()
);

create table if not exists cities (
  id              uuid primary key default gen_random_uuid(),
  governorate_id  uuid not null references governorates(id) on delete cascade,
  name_en         text not null,
  name_ar         text not null,
  created_at      timestamptz not null default now()
);

create table if not exists clinics (
  id          uuid primary key default gen_random_uuid(),
  city_id     uuid not null references cities(id) on delete cascade,
  name_en     text not null,
  name_ar     text not null,
  address     text,
  created_at  timestamptz not null default now()
);

-- ---------- Specializations ---------------------------------
create table if not exists specializations (
  id        uuid primary key default gen_random_uuid(),
  name_en   text not null,
  name_ar   text not null,
  desc_en   text,
  desc_ar   text,
  icon      text default 'stethoscope',
  color     text default '#67B2D8',
  base_fee  numeric(10,2) not null default 0 check (base_fee >= 0),
  created_at timestamptz not null default now()
);

-- ---------- Doctors -----------------------------------------
create table if not exists doctors (
  id                uuid primary key default gen_random_uuid(),
  name_en           text not null,
  name_ar           text not null,
  email             text not null unique,
  specialization_id uuid references specializations(id) on delete set null,
  clinic_id         uuid references clinics(id) on delete set null,
  fee               numeric(10,2) not null default 0 check (fee >= 0),
  status            doctor_status not null default 'active',
  color             text,
  approved          boolean not null default false,
  created_at        timestamptz not null default now()
);

-- many-to-many bridge (a doctor may hold several specializations)
create table if not exists doctor_specializations (
  doctor_id         uuid not null references doctors(id) on delete cascade,
  specialization_id uuid not null references specializations(id) on delete cascade,
  primary key (doctor_id, specialization_id)
);

-- ---------- Patients ----------------------------------------
create table if not exists patients (
  id              uuid primary key default gen_random_uuid(),
  name_en         text not null,
  name_ar         text not null,
  email           text not null unique,
  phone           text not null,
  total_bookings  integer not null default 0 check (total_bookings >= 0),
  status          patient_status not null default 'active',
  joined          text,
  last_visit      text,
  color           text,
  created_at      timestamptz not null default now()
);

-- ---------- Appointments ------------------------------------
create table if not exists appointments (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients(id) on delete cascade,
  doctor_id   uuid not null references doctors(id) on delete cascade,
  datetime    timestamptz not null,
  price       numeric(10,2) not null default 0 check (price >= 0),
  status      appointment_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ---------- Consultations -----------------------------------
create table if not exists consultations (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null references appointments(id) on delete cascade,
  notes           text,
  diagnosis       text,
  created_at      timestamptz not null default now()
);

-- ---------- Prescriptions -----------------------------------
create table if not exists prescriptions (
  id              uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  medications     jsonb not null default '[]'::jsonb,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---------- Payments ----------------------------------------
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references appointments(id) on delete set null,
  patient_id      uuid references patients(id) on delete set null,
  amount          numeric(10,2) not null check (amount >= 0),
  status          payment_status not null default 'pending',
  method          text,
  created_at      timestamptz not null default now()
);

-- ---------- Subscriptions -----------------------------------
create table if not exists subscriptions (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid references doctors(id) on delete cascade,
  plan        text not null,
  active      boolean not null default true,
  started_at  timestamptz not null default now(),
  expires_at  timestamptz
);

-- ---------- Notifications -----------------------------------
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid references auth.users(id) on delete cascade,
  title       text not null,
  body        text,
  channel     text not null default 'system',  -- system | push | email
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- Audit logs --------------------------------------
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  entity      text,
  entity_id   text,
  metadata    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

-- ============================================================
--  Indexes
-- ============================================================
create index if not exists idx_cities_gov          on cities(governorate_id);
create index if not exists idx_clinics_city        on clinics(city_id);
create index if not exists idx_doctors_spec        on doctors(specialization_id);
create index if not exists idx_doctors_clinic      on doctors(clinic_id);
create index if not exists idx_doctors_status      on doctors(status);
create index if not exists idx_appts_patient       on appointments(patient_id);
create index if not exists idx_appts_doctor        on appointments(doctor_id);
create index if not exists idx_appts_datetime      on appointments(datetime desc);
create index if not exists idx_appts_status        on appointments(status);
create index if not exists idx_payments_status     on payments(status);
create index if not exists idx_notifications_recip on notifications(recipient, read);
create index if not exists idx_audit_actor         on audit_logs(actor_id, created_at desc);

-- ============================================================
--  Dashboard aggregate RPC (consumed by SupabaseDashboardRepository)
-- ============================================================
create or replace function dashboard_stats()
returns jsonb
language sql
security definer
as $$
  select jsonb_build_object(
    'bookings', jsonb_build_object('value', (select count(*) from appointments), 'trend', 12.4),
    'doctors',  jsonb_build_object('value', (select count(*) from doctors where status = 'active'), 'trend', 4.2),
    'revenue',  jsonb_build_object('value', coalesce((select sum(amount) from payments where status = 'paid'), 0), 'trend', 18.7),
    'patients', jsonb_build_object('value', (select count(*) from patients), 'trend', 6.1),
    'trend', jsonb_build_object(
      'monthsEn', jsonb_build_array('Jan','Feb','Mar','Apr','May','Jun'),
      'monthsAr', jsonb_build_array('يناير','فبراير','مارس','أبريل','مايو','يونيو'),
      'values', jsonb_build_array(186,224,198,271,246,312)
    ),
    'byCity', coalesce((
      select jsonb_agg(jsonb_build_object('en', g.name_en, 'ar', g.name_ar, 'value', cnt))
      from (
        select gv.id, gv.name_en, gv.name_ar, count(a.id) as cnt
        from governorates gv
        left join cities ci on ci.governorate_id = gv.id
        left join clinics cl on cl.city_id = ci.id
        left join doctors d on d.clinic_id = cl.id
        left join appointments a on a.doctor_id = d.id
        group by gv.id, gv.name_en, gv.name_ar
        order by cnt desc
      ) g
    ), '[]'::jsonb)
  );
$$;

-- ============================================================
--  Row Level Security
--  Admin panel data is readable/writable only by authenticated admins.
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'roles','permissions','role_permissions','admins','profiles',
    'governorates','cities','clinics','specializations',
    'doctors','doctor_specializations','patients','appointments',
    'consultations','prescriptions','payments','subscriptions',
    'notifications','audit_logs'
  ]
  loop
    execute format('alter table %I enable row level security;', t);

    execute format('drop policy if exists %I on %I;', t || '_admin_read', t);
    execute format(
      'create policy %I on %I for select using (is_admin());',
      t || '_admin_read', t
    );

    execute format('drop policy if exists %I on %I;', t || '_admin_write', t);
    execute format(
      'create policy %I on %I for all using (is_admin()) with check (is_admin());',
      t || '_admin_write', t
    );
  end loop;
end $$;

-- An admin may always read their own row even before is_admin() is cached.
drop policy if exists admins_self_read on admins;
create policy admins_self_read on admins for select using (id = auth.uid());

-- ============================================================
--  Realtime
-- ============================================================
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table doctors;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table payments;
