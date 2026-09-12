import type { SupabaseClient } from '@supabase/supabase-js';
import { buildRefMaps, type RefMaps } from '@/infrastructure/mappers/doctor.mapper';
import type {
  SpecialtyRow,
  ClinicRow,
  CityRow,
  GovernorateRow,
} from '@/infrastructure/supabase/types';

/**
 * Loads the reference tables (specialties + location hierarchy) and builds the
 * in-memory lookup maps used to resolve joins on the client. Shared by the
 * doctors and appointments repositories.
 */
export async function loadRefMaps(db: SupabaseClient): Promise<RefMaps> {
  const [specs, clinics, cities, govs] = await Promise.all([
    db.from('specialties').select('id, name, name_ar, icon, color, base_fee, description'),
    db.from('Clinics').select('id, name, address, city_id'),
    db.from('Cities').select('id, name, governorate_id'),
    db.from('Governorates').select('id, name'),
  ]);
  if (specs.error) throw specs.error;
  if (clinics.error) throw clinics.error;
  if (cities.error) throw cities.error;
  if (govs.error) throw govs.error;

  return buildRefMaps(
    (specs.data ?? []) as SpecialtyRow[],
    (clinics.data ?? []) as ClinicRow[],
    (cities.data ?? []) as CityRow[],
    (govs.data ?? []) as GovernorateRow[],
  );
}
