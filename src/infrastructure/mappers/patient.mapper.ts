import type { Patient } from '@/domain/entities/Patient';
import { PatientStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type { ProfileRow } from '@/infrastructure/supabase/types';

/** profiles (id, name, phone, status) → domain Patient. */
export function toPatient(row: ProfileRow, bookingCount = 0, index = 0): Patient {
  return {
    id: row.id,
    nameEn: row.name ?? '—',
    nameAr: row.name ?? '—',
    email: '',
    phone: row.phone ?? '',
    totalBookings: bookingCount,
    status: row.status === 'blocked' ? PatientStatus.Blocked : PatientStatus.Active,
    joined: '',
    lastVisit: '',
    color: colorAt(index + 2),
  };
}
