import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import { localDb, delay } from './LocalDatabase';
import {
  SEED_SPECIALIZATIONS,
  SEED_LOCATIONS,
  clinicNameEn,
  clinicNameAr,
} from '@/infrastructure/seed/seed-data';

/** Resolves clinic → city/governorate context from the location tree. */
function clinicContext(clinicId: EntityId) {
  for (const g of SEED_LOCATIONS) {
    for (const c of g.cities) {
      for (const cl of c.clinics) {
        if (cl.id === clinicId) {
          return { cityEn: c.nameEn, cityAr: c.nameAr, govEn: g.nameEn, govAr: g.nameAr };
        }
      }
    }
  }
  // also search dynamically created locations
  const live = localDb.read('locations');
  for (const g of live) {
    for (const c of g.cities) {
      for (const cl of c.clinics) {
        if (cl.id === clinicId) {
          return { cityEn: c.nameEn, cityAr: c.nameAr, govEn: g.nameEn, govAr: g.nameAr };
        }
      }
    }
  }
  return { cityEn: '', cityAr: '', govEn: '', govAr: '' };
}

export class LocalDoctorsRepository implements IDoctorsRepository {
  list(): Promise<Doctor[]> {
    return delay(localDb.read('doctors'));
  }

  async getById(id: EntityId): Promise<Doctor | null> {
    return delay(localDb.read('doctors').find((d) => d.id === id) ?? null);
  }

  async save(input: DoctorInput): Promise<Doctor> {
    const doctors = localDb.read('doctors');
    const sp = SEED_SPECIALIZATIONS.find((s) => s.id === input.specializationId);
    const ctx = clinicContext(input.clinicId);
    const existing = doctors.find((d) => d.id === input.id);

    const nameEn = input.nameEn.startsWith('Dr.') ? input.nameEn : 'Dr. ' + input.nameEn;
    const nameAr = input.nameAr
      ? input.nameAr.startsWith('د.')
        ? input.nameAr
        : 'د. ' + input.nameAr
      : nameEn;

    const doctor: Doctor = {
      id: input.id ?? 'd' + Date.now(),
      nameEn,
      nameAr,
      email: input.email || input.nameEn.toLowerCase().replace(/[^a-z]/g, '.') + '@shefaa.eg',
      specializationId: input.specializationId,
      specialtyEn: sp?.nameEn ?? '',
      specialtyAr: sp?.nameAr ?? '',
      clinicId: input.clinicId,
      clinicEn: clinicNameEn(input.clinicId),
      clinicAr: clinicNameAr(input.clinicId),
      cityEn: ctx.cityEn,
      cityAr: ctx.cityAr,
      govEn: ctx.govEn,
      govAr: ctx.govAr,
      fee: input.fee,
      status: input.status,
      color: existing?.color ?? colorAt(doctors.length),
    };

    const next = existing
      ? doctors.map((d) => (d.id === doctor.id ? doctor : d))
      : [doctor, ...doctors];
    localDb.write('doctors', next);
    return delay(doctor);
  }

  async delete(id: EntityId): Promise<void> {
    localDb.write('doctors', localDb.read('doctors').filter((d) => d.id !== id));
    await delay(null);
  }

  async setStatus(id: EntityId, active: boolean): Promise<Doctor> {
    const doctors = localDb.read('doctors').map((d) =>
      d.id === id ? { ...d, status: active ? DoctorStatus.Active : DoctorStatus.Inactive } : d,
    );
    localDb.write('doctors', doctors);
    return delay(doctors.find((d) => d.id === id)!);
  }
}
