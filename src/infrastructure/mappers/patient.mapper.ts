import type { Patient } from '@/domain/entities/Patient';
import { PatientStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type { PatientRow } from '@/infrastructure/supabase/types';

export function toPatient(row: PatientRow, index = 0): Patient {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    email: row.email,
    phone: row.phone,
    totalBookings: row.total_bookings,
    status: row.status === 'blocked' ? PatientStatus.Blocked : PatientStatus.Active,
    joined: row.joined,
    lastVisit: row.last_visit ?? '',
    color: row.color ?? colorAt(index + 2),
  };
}
