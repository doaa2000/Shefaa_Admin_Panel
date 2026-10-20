import type { Specialization } from '@/domain/entities/Specialization';
import type { SpecialtyRow } from '@/infrastructure/supabase/types';

/** specialties (id, name, icon, name_ar) → domain */
export function toSpecialization(row: SpecialtyRow): Specialization {
  return {
    id: String(row.id),
    nameEn: row.name,
    nameAr: row.name_ar ?? row.name,
    icon: row.icon ?? 'stethoscope',
  };
}
