/**
 * Composition root. This is the ONLY place that knows which concrete backend is
 * in use. Switching to a future ASP.NET / Node / NestJS / Laravel API requires
 * changing only the bindings here — no UI, store, composable, service, or domain
 * model changes.
 */
import { container } from './container';
import { TOKENS } from './tokens';

// Repository interfaces
import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';

// Local implementations
import { LocalDoctorsRepository } from '@/infrastructure/repositories/local/LocalDoctorsRepository';
import { LocalPatientsRepository } from '@/infrastructure/repositories/local/LocalPatientsRepository';
import { LocalSpecializationsRepository } from '@/infrastructure/repositories/local/LocalSpecializationsRepository';
import { LocalClinicsRepository } from '@/infrastructure/repositories/local/LocalClinicsRepository';
import { LocalAppointmentsRepository } from '@/infrastructure/repositories/local/LocalAppointmentsRepository';
import { LocalDashboardRepository } from '@/infrastructure/repositories/local/LocalDashboardRepository';
import { LocalAuthRepository } from '@/infrastructure/repositories/local/LocalAuthRepository';

// Supabase implementations
import { SupabaseDoctorsRepository } from '@/infrastructure/repositories/supabase/SupabaseDoctorsRepository';
import { SupabasePatientsRepository } from '@/infrastructure/repositories/supabase/SupabasePatientsRepository';
import { SupabaseSpecializationsRepository } from '@/infrastructure/repositories/supabase/SupabaseSpecializationsRepository';
import { SupabaseClinicsRepository } from '@/infrastructure/repositories/supabase/SupabaseClinicsRepository';
import { SupabaseAppointmentsRepository } from '@/infrastructure/repositories/supabase/SupabaseAppointmentsRepository';
import { SupabaseDashboardRepository } from '@/infrastructure/repositories/supabase/SupabaseDashboardRepository';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/supabase/SupabaseAuthRepository';

// Services
import { DoctorsService } from '@/application/services/DoctorsService';
import { PatientsService } from '@/application/services/PatientsService';
import { SpecializationsService } from '@/application/services/SpecializationsService';
import { LocationsService } from '@/application/services/LocationsService';
import { AppointmentsService } from '@/application/services/AppointmentsService';
import { DashboardService } from '@/application/services/DashboardService';
import { AuthService } from '@/application/services/AuthService';

type Provider = 'local' | 'supabase';

interface RepoBindings {
  doctors: () => IDoctorsRepository;
  patients: () => IPatientsRepository;
  specializations: () => ISpecializationsRepository;
  clinics: () => IClinicsRepository;
  appointments: () => IAppointmentsRepository;
  dashboard: () => IDashboardRepository;
  auth: () => IAuthRepository;
}

const BINDINGS: Record<Provider, RepoBindings> = {
  local: {
    doctors: () => new LocalDoctorsRepository(),
    patients: () => new LocalPatientsRepository(),
    specializations: () => new LocalSpecializationsRepository(),
    clinics: () => new LocalClinicsRepository(),
    appointments: () => new LocalAppointmentsRepository(),
    dashboard: () => new LocalDashboardRepository(),
    auth: () => new LocalAuthRepository(),
  },
  supabase: {
    doctors: () => new SupabaseDoctorsRepository(),
    patients: () => new SupabasePatientsRepository(),
    specializations: () => new SupabaseSpecializationsRepository(),
    clinics: () => new SupabaseClinicsRepository(),
    appointments: () => new SupabaseAppointmentsRepository(),
    dashboard: () => new SupabaseDashboardRepository(),
    auth: () => new SupabaseAuthRepository(),
  },
};

export function registerServices(): void {
  const provider: Provider =
    import.meta.env.VITE_BACKEND_PROVIDER === 'supabase' ? 'supabase' : 'local';
  const b = BINDINGS[provider];

  // --- Bind repositories (the only provider-specific layer) ---
  container.register(TOKENS.DoctorsRepository, b.doctors);
  container.register(TOKENS.PatientsRepository, b.patients);
  container.register(TOKENS.SpecializationsRepository, b.specializations);
  container.register(TOKENS.ClinicsRepository, b.clinics);
  container.register(TOKENS.AppointmentsRepository, b.appointments);
  container.register(TOKENS.DashboardRepository, b.dashboard);
  container.register(TOKENS.AuthRepository, b.auth);

  // --- Bind services (depend only on repository abstractions) ---
  container.register(
    TOKENS.DoctorsService,
    (c) => new DoctorsService(c.resolve(TOKENS.DoctorsRepository)),
  );
  container.register(
    TOKENS.PatientsService,
    (c) => new PatientsService(c.resolve(TOKENS.PatientsRepository)),
  );
  container.register(
    TOKENS.SpecializationsService,
    (c) => new SpecializationsService(c.resolve(TOKENS.SpecializationsRepository)),
  );
  container.register(
    TOKENS.LocationsService,
    (c) => new LocationsService(c.resolve(TOKENS.ClinicsRepository)),
  );
  container.register(
    TOKENS.AppointmentsService,
    (c) => new AppointmentsService(c.resolve(TOKENS.AppointmentsRepository)),
  );
  container.register(
    TOKENS.DashboardService,
    (c) =>
      new DashboardService(
        c.resolve(TOKENS.DashboardRepository),
        c.resolve(TOKENS.AppointmentsRepository),
        c.resolve(TOKENS.DoctorsRepository),
      ),
  );
  container.register(TOKENS.AuthService, (c) => new AuthService(c.resolve(TOKENS.AuthRepository)));
}
