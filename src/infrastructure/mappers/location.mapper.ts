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
          .map((cl) => ({
            id: String(cl.id),
            nameEn: cl.name,
            nameAr: cl.name,
            address: cl.address ?? '',
          })),
      })),
  }));
}

/**
 * The one line the patient app shows for where a doctor practises.
 *
 * The app reads `Doctors.location` (through doctors_public) and prints it
 * under «العيادة» on the doctor's page and on every doctor card; it does not
 * look at Clinics at all. So the panel writes the clinic, its address, the
 * city and the governorate into that column whenever it knows them, in the
 * order a patient would read them.
 */
export function clinicLocationText(parts: {
  clinic?: string | null;
  address?: string | null;
  city?: string | null;
  governorate?: string | null;
}): string {
  return [parts.clinic, parts.address, parts.city, parts.governorate]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join('، ');
}
