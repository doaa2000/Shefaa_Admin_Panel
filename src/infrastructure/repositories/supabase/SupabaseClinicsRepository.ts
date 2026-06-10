import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { Governorate, LocationChain } from '@/domain/entities/Location';
import { LocationLevel } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { buildLocationTree } from '@/infrastructure/mappers/location.mapper';
import type { GovernorateRow, CityRow, ClinicRow } from '@/infrastructure/supabase/types';

export class SupabaseClinicsRepository implements IClinicsRepository {
  private db = getSupabaseClient();

  async listTree(): Promise<Governorate[]> {
    const [govs, cities, clinics] = await Promise.all([
      this.db.from('Governorates').select('id, name, country_id').order('name'),
      this.db.from('Cities').select('id, name, governorate_id').order('name'),
      this.db.from('Clinics').select('id, name, address, city_id').order('name'),
    ]);
    if (govs.error) throw govs.error;
    if (cities.error) throw cities.error;
    if (clinics.error) throw clinics.error;
    return buildLocationTree(
      (govs.data ?? []) as GovernorateRow[],
      (cities.data ?? []) as CityRow[],
      (clinics.data ?? []) as ClinicRow[],
    );
  }

  async addNode(
    level: LocationLevel,
    nameEn: string,
    _nameAr: string,
    parent: LocationChain,
  ): Promise<Governorate[]> {
    if (level === LocationLevel.Governorate) {
      const { error } = await this.db.from('Governorates').insert({ name: nameEn });
      if (error) throw error;
    } else if (level === LocationLevel.City) {
      const { error } = await this.db
        .from('Cities')
        .insert({ name: nameEn, governorate_id: Number(parent.gov) });
      if (error) throw error;
    } else {
      const { error } = await this.db
        .from('Clinics')
        .insert({ name: nameEn, city_id: Number(parent.city) });
      if (error) throw error;
    }
    return this.listTree();
  }

  async deleteNode(level: LocationLevel, ids: LocationChain): Promise<Governorate[]> {
    const table =
      level === LocationLevel.Governorate
        ? 'Governorates'
        : level === LocationLevel.City
          ? 'Cities'
          : 'Clinics';
    const id =
      level === LocationLevel.Governorate ? ids.gov : level === LocationLevel.City ? ids.city : ids.clinic;
    const { error } = await this.db.from(table).delete().eq('id', Number(id));
    if (error) throw error;
    return this.listTree();
  }
}
