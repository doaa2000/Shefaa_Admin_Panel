import type { Specialization } from '@/domain/entities/Specialization';
import type { SpecializationRow } from '@/infrastructure/supabase/types';

export function toSpecialization(row: SpecializationRow): Specialization {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    descEn: row.desc_en ?? '',
    descAr: row.desc_ar ?? '',
    icon: row.icon ?? 'stethoscope',
    color: row.color ?? '#67B2D8',
    baseFee: row.base_fee,
  };
}
