import type { Doctor } from '@/domain/entities/Doctor';
import { DoctorStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type {
  DoctorRow,
  SpecialtyRow,
  ClinicRow,
  CityRow,
  GovernorateRow,
} from '@/infrastructure/supabase/types';

/** Lookup maps resolved once per query and shared across rows. */
export interface RefMaps {
  specialties: Map<number, SpecialtyRow>;
  clinics: Map<number, ClinicRow>;
  cities: Map<number, CityRow>;
  governorates: Map<number, GovernorateRow>;
}

export function buildRefMaps(
  specialties: SpecialtyRow[],
  clinics: ClinicRow[],
  cities: CityRow[],
  governorates: GovernorateRow[],
): RefMaps {
  return {
    specialties: new Map(specialties.map((s) => [s.id, s])),
    clinics: new Map(clinics.map((c) => [c.id, c])),
    cities: new Map(cities.map((c) => [c.id, c])),
    governorates: new Map(governorates.map((g) => [g.id, g])),
  };
}

export function toDoctor(row: DoctorRow, maps: RefMaps, index = 0): Doctor {
  const sp = row.specialty_id != null ? maps.specialties.get(row.specialty_id) : undefined;
  const clinic = row.clinic_id != null ? maps.clinics.get(row.clinic_id) : undefined;
  const city = clinic?.city_id != null ? maps.cities.get(clinic.city_id) : undefined;
  const gov = city?.governorate_id != null ? maps.governorates.get(city.governorate_id) : undefined;

  return {
    id: String(row.id),
    nameEn: row.name,
    nameAr: row.name,
    email: row.email ?? '',
    specializationId: row.specialty_id != null ? String(row.specialty_id) : '',
    specialtyEn: sp?.name ?? row.specialization ?? '',
    specialtyAr: sp?.name_ar ?? sp?.name ?? row.specialization ?? '',
    clinicId: row.clinic_id != null ? String(row.clinic_id) : '',
    clinicEn: clinic?.name ?? '',
    clinicAr: clinic?.name ?? '',
    cityEn: city?.name ?? '',
    cityAr: city?.name ?? '',
    govEn: gov?.name ?? '',
    govAr: gov?.name ?? '',
    fee: row.consultation_fee ?? 0,
    status: row.status === 'inactive' ? DoctorStatus.Inactive : DoctorStatus.Active,
    color: colorAt(index),
  };
}
