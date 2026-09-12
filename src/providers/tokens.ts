import { createToken } from './container';
import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { IBannersRepository } from '@/domain/repositories/IBannersRepository';
import type { DoctorsService } from '@/application/services/DoctorsService';
import type { PatientsService } from '@/application/services/PatientsService';
import type { SpecializationsService } from '@/application/services/SpecializationsService';
import type { LocationsService } from '@/application/services/LocationsService';
import type { AppointmentsService } from '@/application/services/AppointmentsService';
import type { DashboardService } from '@/application/services/DashboardService';
import type { AuthService } from '@/application/services/AuthService';
import type { BannersService } from '@/application/services/BannersService';

/** Repository tokens (domain abstractions). */
export const TOKENS = {
  // Repositories
  DoctorsRepository: createToken<IDoctorsRepository>('IDoctorsRepository'),
  PatientsRepository: createToken<IPatientsRepository>('IPatientsRepository'),
  SpecializationsRepository: createToken<ISpecializationsRepository>('ISpecializationsRepository'),
  ClinicsRepository: createToken<IClinicsRepository>('IClinicsRepository'),
  AppointmentsRepository: createToken<IAppointmentsRepository>('IAppointmentsRepository'),
  DashboardRepository: createToken<IDashboardRepository>('IDashboardRepository'),
  AuthRepository: createToken<IAuthRepository>('IAuthRepository'),
  BannersRepository: createToken<IBannersRepository>('IBannersRepository'),

  // Services
  DoctorsService: createToken<DoctorsService>('DoctorsService'),
  PatientsService: createToken<PatientsService>('PatientsService'),
  SpecializationsService: createToken<SpecializationsService>('SpecializationsService'),
  LocationsService: createToken<LocationsService>('LocationsService'),
  AppointmentsService: createToken<AppointmentsService>('AppointmentsService'),
  DashboardService: createToken<DashboardService>('DashboardService'),
  AuthService: createToken<AuthService>('AuthService'),
  BannersService: createToken<BannersService>('BannersService'),
} as const;
