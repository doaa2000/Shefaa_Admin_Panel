# Shefaa — Healthcare Clinic Admin Panel

An enterprise-grade, bilingual (English / العربية, full RTL) administration panel
for a multi-clinic healthcare network. Built with **Vue 3 + TypeScript + Vite +
Pinia + Vue Router + Tailwind CSS**, following **Clean Architecture**, the
**Repository Pattern**, **Dependency Inversion**, and a strict separation of
concerns so the backend can be swapped without touching the UI.

The UI is a faithful, pixel-level port of the provided design (the design is the
single source of truth — colors, spacing, typography, layout and navigation are
unchanged). Primary color `#67B2D8`, secondary `#FFFFFF`.

---

## Modules (from the design)

| Module | Highlights |
| --- | --- |
| **Dashboard** | KPI cards, bookings trend bar chart, bookings-by-governorate, live activity feed, status donut, recent bookings table |
| **Doctors** | List, search, filter by specialization, create/edit, approve/activate/deactivate, delete |
| **Specializations** | CRUD with icon + color picker and live preview, doctors-assigned count |
| **Locations** | Governorate → City → Clinic tree, expand/collapse, add/delete at each level, doctor avatars per clinic |
| **Appointments** | Network-wide list, multi-filter (city/doctor/status/search), status summary, CSV export |
| **Users (Patients)** | List, status filter, block/unblock, slide-in profile with activity |
| **Authentication** | Login screen, route guard, session restore |

---

## Architecture

```
UI (Pages / Components / Layouts)
        ↓
Composables (presentation/composables)      ← Vue-reactive bridge
        ↓
Pinia Stores (presentation/stores)          ← cached state, call services
        ↓
Application Services / Use Cases            ← business orchestration
        ↓
Repository Interfaces (domain/repositories) ← abstractions only
        ↓
Repository Implementations (infrastructure) ← Local | Supabase | future API
        ↓
Backend (Supabase today; ASP.NET / Node / NestJS / Laravel tomorrow)
```

### Folder structure

```
src/
├── domain/            # Entities, value objects, enums, repository interfaces (no framework, no backend)
│   ├── entities/
│   ├── repositories/  # IDoctorsRepository, IClinicsRepository, … (interfaces)
│   ├── value-objects/ # Money
│   └── enums/
├── application/       # Business logic — framework-agnostic
│   ├── services/      # DoctorsService, AppointmentsService, …
│   ├── use-cases/     # Single-responsibility commands (doctors fully expanded as reference)
│   └── validation/    # Reusable form validators
├── infrastructure/    # Backend-specific code
│   ├── supabase/      # The ONLY place the Supabase SDK is imported
│   ├── repositories/  # local/ (in-memory + localStorage) and supabase/ implementations
│   ├── mappers/       # DB rows → domain entities
│   └── seed/          # Design seed data
├── presentation/      # Everything Vue
│   ├── pages/  components/  layouts/  stores/  composables/  routes/
├── providers/         # DI container, tokens, i18n, composition root (registerServices)
├── router/
├── shared/            # styles (design system), utils, types
└── main.ts
```

### How backends are swapped

The **composition root** is [`src/providers/registerServices.ts`](src/providers/registerServices.ts).
It is the *only* file that knows which concrete backend is bound. To migrate
from Supabase to an ASP.NET Core / Node / NestJS / Laravel API you:

1. Add API repository implementations under
   `infrastructure/repositories/api/` implementing the same domain interfaces.
2. Add an `'api'` branch to the `BINDINGS` map in `registerServices.ts`.

No changes are required in components, pages, layouts, stores, composables,
services, use cases, or domain models — they depend only on interfaces resolved
through the DI container (`src/providers/container.ts`).

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

`.env`:

```env
# "local" runs entirely on in-memory seed data — no backend needed.
VITE_BACKEND_PROVIDER=local

# Required only when VITE_BACKEND_PROVIDER=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run

```bash
npm run dev        # http://localhost:5173
```

**Demo login:** `admin@shefaa.eg` / `shefaa123`

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`vue-tsc`) then production build |
| `npm run preview` | Preview the production build |
| `npm run type-check` | Strict TypeScript check (no `any`, no unused) |

---

## Supabase backend

The admin panel shares **one Supabase project / database** with the patient app.
Use the **same** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as the app.

### A) Existing app database (recommended — what we use)

The Supabase repositories and mappers are wired to the app's real tables
(`specialties`, `Doctors`, `Governorates`, `Cities`, `Clinics`, `bookings`,
`profiles`, `payments`, …) — joins are resolved client-side, so no FK metadata
is required.

1. Run [`supabase/migrations/001_admin_integration.sql`](supabase/migrations/001_admin_integration.sql)
   once in the SQL editor. It is **additive and safe** (no drops/renames):
   - adds enrichment columns to `specialties` (`name_ar`, `description`, `color`, `base_fee`)
   - adds a `status` column to `Doctors` and `profiles` (activate / block)
   - enables **Realtime** on `specialties`, `Doctors`, `bookings`
   - adds admin RLS policies for authenticated users
   - creates the `admin_dashboard_stats()` RPC (real KPI numbers)
2. Create an admin login: add a user in **Supabase Auth** (their `profiles.name`
   becomes the displayed admin name). Any authenticated user can sign in to the
   panel; tighten with your own RLS/role check when ready.
3. `.env`: `VITE_BACKEND_PROVIDER=supabase` + the app's URL and anon key.

#### Add specialization in admin → appears in the app

Admin save → `insert into specialties (name, icon, …)` → the app reads the same
`specialties` table. For **instant** updates (no refresh), subscribe in the app:

```ts
supabase
  .channel('specialties')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'specialties' },
      () => { /* refetch / update the specialties list in the app */ })
  .subscribe();
```

> Note: the admin writes the icon **key** (e.g. `tooth`) into `specialties.icon`.
> If the app expects an image URL there, either keep using key-based icons in the
> app or adjust the admin icon field to store a URL.

### B) Greenfield database (reference)

[`supabase/schema.sql`](supabase/schema.sql) is a complete, normalized schema
(bilingual, UUID keys, full RBAC + audit tables) for a fresh project that doesn't
already have the app's tables. It is a reference; the live integration uses path A.

---

## Code quality

- **TypeScript everywhere**, `strict` mode, **no `any`**, no unused locals.
- **DRY / SRP**: reusable UI primitives (`BaseButton`, `BaseModal`, `SidePanel`,
  `StatusBadge`, `DataTable`-style tables, charts, states) and shared formatters.
- **Centralized** loading/error/empty states and toast notifications.
- **Form validation** rules live in `application/validation` (never in components).
- Domain models are decoupled from the database via **mappers**.

---

## Internationalization

Full EN/AR support with automatic `dir="rtl"` switching and localized number /
currency formatting (Eastern Arabic numerals + EGP). Dictionaries live in
`src/providers/i18n/locales`.
