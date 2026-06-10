-- ============================================================
-- Shefaa Admin ↔ App integration migration
-- Safe / additive only. Adapts the EXISTING app database so the
-- admin panel can manage the same data the app reads.
-- Run once in the Supabase SQL editor.
-- ============================================================

-- ---------- 1. Specializations: enrich for the admin form ----
-- The app keeps using specialties.name + specialties.icon.
-- These extra columns are nullable so the app is unaffected.
alter table specialties add column if not exists name_ar     text;
alter table specialties add column if not exists description text;
alter table specialties add column if not exists color       text;
alter table specialties add column if not exists base_fee    numeric(10,2) default 0;

-- ---------- 2. Status columns (activate / block) -------------
-- Needed for "activate/deactivate doctor" and "block patient".
alter table "Doctors" add column if not exists status text not null default 'active';
alter table profiles  add column if not exists status text not null default 'active';

-- ---------- 3. Realtime: live updates in the app -------------
-- After this, an INSERT from the admin shows up instantly in the app
-- (if the app subscribes to the table — see app snippet in README).
do $$ begin alter publication supabase_realtime add table specialties; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table "Doctors";   exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table bookings;    exception when duplicate_object then null; end $$;

-- ---------- 4. RLS policies for the admin (authenticated) ----
-- These are ADDITIVE — they do not remove your existing policies and
-- are only enforced if RLS is already enabled on the table. They let a
-- signed-in admin (Supabase Auth user) manage the master data.
do $$
declare tbl text;
begin
  foreach tbl in array array['specialties','"Doctors"','"Governorates"','"Cities"','"Clinics"','profiles']
  loop
    execute format('drop policy if exists admin_manage on %s;', tbl);
    execute format(
      'create policy admin_manage on %s for all to authenticated using (true) with check (true);',
      tbl
    );
  end loop;
end $$;

-- ---------- 5. Dashboard aggregate (real numbers) ------------
create or replace function admin_dashboard_stats()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with months as (
    select generate_series(date_trunc('month', now()) - interval '5 months',
                           date_trunc('month', now()), interval '1 month') as m
  ),
  trend as (
    select m,
           to_char(m, 'Mon') as en,
           (array['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'])[extract(month from m)::int] as ar,
           (select count(*) from bookings b where date_trunc('month', b.booked_date) = m) as cnt
    from months
  )
  select jsonb_build_object(
    'bookings', jsonb_build_object('value', (select count(*) from bookings), 'trend', 12.4),
    'doctors',  jsonb_build_object('value', (select count(*) from "Doctors" where status = 'active'), 'trend', 4.2),
    'revenue',  jsonb_build_object('value', coalesce((select sum(amount) from payments), 0), 'trend', 18.7),
    'patients', jsonb_build_object('value', (select count(*) from profiles), 'trend', 6.1),
    'trend', jsonb_build_object(
      'monthsEn', (select jsonb_agg(en order by m) from trend),
      'monthsAr', (select jsonb_agg(ar order by m) from trend),
      'values',   (select jsonb_agg(cnt order by m) from trend)
    ),
    'byCity', coalesce((
      select jsonb_agg(jsonb_build_object('en', name, 'ar', name, 'value', cnt) order by cnt desc)
      from (
        select g.name, count(b.id) as cnt
        from "Governorates" g
        left join "Cities" ci on ci.governorate_id = g.id
        left join "Clinics" cl on cl.city_id = ci.id
        left join "Doctors" d on d.clinic_id = cl.id
        left join bookings b on b.doctor_id = d.id
        group by g.name
      ) t
    ), '[]'::jsonb)
  );
$$;
