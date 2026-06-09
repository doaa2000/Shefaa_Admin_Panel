import type { Doctor } from '@/domain/entities/Doctor';
import { DoctorStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type { DoctorRow } from '@/infrastructure/supabase/types';

/** Maps a Supabase doctor row (with joins) to the domain Doctor entity. */
export function toDoctor(row: DoctorRow, index = 0): Doctor {
  const clinic = row.clinic;
  const city = clinic?.city ?? null;
  const gov = city?.governorate ?? null;
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    email: row.email,
    specializationId: row.specialization_id,
    specialtyEn: row.specialization?.name_en ?? '',
    specialtyAr: row.specialization?.name_ar ?? '',
    clinicId: row.clinic_id,
    clinicEn: clinic?.name_en ?? '',
    clinicAr: clinic?.name_ar ?? '',
    cityEn: city?.name_en ?? '',
    cityAr: city?.name_ar ?? '',
    govEn: gov?.name_en ?? '',
    govAr: gov?.name_ar ?? '',
    fee: row.fee,
    status: row.status === 'inactive' ? DoctorStatus.Inactive : DoctorStatus.Active,
    color: row.color ?? colorAt(index),
  };
}
