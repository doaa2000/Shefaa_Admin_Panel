import type { Governorate } from '@/domain/entities/Location';
import type { GovernorateRow } from '@/infrastructure/supabase/types';

export function toGovernorate(row: GovernorateRow): Governorate {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    cities: (row.cities ?? []).map((c) => ({
      id: c.id,
      nameEn: c.name_en,
      nameAr: c.name_ar,
      clinics: (c.clinics ?? []).map((cl) => ({
        id: cl.id,
        nameEn: cl.name_en,
        nameAr: cl.name_ar,
      })),
    })),
  };
}
