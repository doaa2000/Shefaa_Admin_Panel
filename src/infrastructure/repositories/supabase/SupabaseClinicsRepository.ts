import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { Governorate, LocationChain } from '@/domain/entities/Location';
import { LocationLevel } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toGovernorate } from '@/infrastructure/mappers/location.mapper';
import type { GovernorateRow } from '@/infrastructure/supabase/types';

const SELECT = `
  id, name_en, name_ar,
  cities ( id, name_en, name_ar,
    clinics ( id, name_en, name_ar ) )
`;

export class SupabaseClinicsRepository implements IClinicsRepository {
  private db = getSupabaseClient();

  async listTree(): Promise<Governorate[]> {
    const { data, error } = await this.db.from('governorates').select(SELECT).order('name_en');
    if (error) throw error;
    return ((data ?? []) as unknown as GovernorateRow[]).map(toGovernorate);
  }

  async addNode(
    level: LocationLevel,
    nameEn: string,
    nameAr: string,
    parent: LocationChain,
  ): Promise<Governorate[]> {
    const ar = nameAr || nameEn;
    if (level === LocationLevel.Governorate) {
      const { error } = await this.db.from('governorates').insert({ name_en: nameEn, name_ar: ar });
      if (error) throw error;
    } else if (level === LocationLevel.City) {
      const { error } = await this.db
        .from('cities')
        .insert({ name_en: nameEn, name_ar: ar, governorate_id: parent.gov });
      if (error) throw error;
    } else {
      const { error } = await this.db
        .from('clinics')
        .insert({ name_en: nameEn, name_ar: ar, city_id: parent.city });
      if (error) throw error;
    }
    return this.listTree();
  }

  async deleteNode(level: LocationLevel, ids: LocationChain): Promise<Governorate[]> {
    const table =
      level === LocationLevel.Governorate
        ? 'governorates'
        : level === LocationLevel.City
          ? 'cities'
          : 'clinics';
    const id =
      level === LocationLevel.Governorate ? ids.gov : level === LocationLevel.City ? ids.city : ids.clinic;
    const { error } = await this.db.from(table).delete().eq('id', id);
    if (error) throw error;
    return this.listTree();
  }
}
