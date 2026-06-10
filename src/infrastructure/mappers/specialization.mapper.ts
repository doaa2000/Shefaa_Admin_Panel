import type { Specialization } from '@/domain/entities/Specialization';
import type { SpecialtyRow } from '@/infrastructure/supabase/types';

/** specialties (id, name, icon, name_ar, description, color, base_fee) → domain */
export function toSpecialization(row: SpecialtyRow): Specialization {
  return {
    id: String(row.id),
    nameEn: row.name,
    nameAr: row.name_ar ?? row.name,
    descEn: row.description ?? '',
    descAr: row.description ?? '',
    icon: row.icon ?? 'stethoscope',
    color: row.color ?? '#67B2D8',
    baseFee: row.base_fee ?? 0,
  };
}
