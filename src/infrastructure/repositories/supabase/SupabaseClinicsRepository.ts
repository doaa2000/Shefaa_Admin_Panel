import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { ClinicInput, Governorate, LocationChain } from '@/domain/entities/Location';
import { LocationLevel } from '@/domain/enums';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { buildLocationTree, clinicLocationText } from '@/infrastructure/mappers/location.mapper';
import type { GovernorateRow, CityRow, ClinicRow } from '@/infrastructure/supabase/types';
import { describeWriteError } from './writeGuards';

export class SupabaseClinicsRepository implements IClinicsRepository {
  private db = getSupabaseClient();

  async listTree(): Promise<Governorate[]> {
    const [govs, cities, clinics] = await Promise.all([
      this.db.from('Governorates').select('id, name').order('name'),
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

  async saveClinic(input: ClinicInput): Promise<{ tree: Governorate[]; clinicId: EntityId }> {
    // Names are single-language in the app DB, as for the rest of the tree.
    const payload = {
      name: input.nameEn.trim() || input.nameAr.trim(),
      address: input.address.trim() || null,
      city_id: Number(input.cityId),
    };
    const query = input.id
      ? this.db.from('Clinics').update(payload).eq('id', Number(input.id))
      : this.db.from('Clinics').insert(payload);
    const { data, error } = await query.select('id').single();
    if (error) throw await describeWriteError(error, this.db);

    const clinicId = String((data as { id: number }).id);
    const tree = await this.listTree();
    if (input.id) await this.refreshDoctorLocations(tree, clinicId);
    return { tree, clinicId };
  }

  /**
   * Keeps `Doctors.location` in step with a clinic that changed.
   *
   * That column is a copy -- it is what the patient app prints, and the app
   * does not read Clinics -- so a new address would otherwise reach the app
   * only when each doctor at the clinic happened to be saved again.
   */
  private async refreshDoctorLocations(tree: Governorate[], clinicId: EntityId): Promise<void> {
    for (const g of tree) {
      for (const c of g.cities) {
        const cl = c.clinics.find((x) => x.id === clinicId);
        if (!cl) continue;
        const location = clinicLocationText({
          clinic: cl.nameEn,
          address: cl.address,
          city: c.nameEn,
          governorate: g.nameEn,
        });
        const { error } = await this.db
          .from('Doctors')
          .update({ location })
          .eq('clinic_id', Number(clinicId));
        if (error) throw await describeWriteError(error, this.db);
        return;
      }
    }
  }
}
