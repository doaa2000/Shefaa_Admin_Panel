import type { Governorate } from '@/domain/entities/Location';
import type {
  GovernorateRow,
  CityRow,
  ClinicRow,
} from '@/infrastructure/supabase/types';

/**
 * Builds the governorate → city → clinic tree from the three flat tables.
 * Names are single-language in the app DB, so en and ar mirror the same value.
 */
export function buildLocationTree(
  govs: GovernorateRow[],
  cities: CityRow[],
  clinics: ClinicRow[],
): Governorate[] {
  return govs.map((g) => ({
    id: String(g.id),
    nameEn: g.name,
    nameAr: g.name,
    cities: cities
      .filter((c) => c.governorate_id === g.id)
      .map((c) => ({
        id: String(c.id),
        nameEn: c.name,
        nameAr: c.name,
        clinics: clinics
          .filter((cl) => cl.city_id === c.id)
          .map((cl) => ({ id: String(cl.id), nameEn: cl.name, nameAr: cl.name })),
      })),
  }));
}
