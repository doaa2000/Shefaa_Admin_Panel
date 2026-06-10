import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toSpecialization } from '@/infrastructure/mappers/specialization.mapper';
import type { SpecialtyRow } from '@/infrastructure/supabase/types';

const TABLE = 'specialties';
const SELECT = 'id, name, icon, name_ar, description, color, base_fee';

export class SupabaseSpecializationsRepository implements ISpecializationsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Specialization[]> {
    const { data, error } = await this.db.from(TABLE).select(SELECT).order('name');
    if (error) throw error;
    return ((data ?? []) as SpecialtyRow[]).map(toSpecialization);
  }

  async getById(id: EntityId): Promise<Specialization | null> {
    const { data, error } = await this.db.from(TABLE).select(SELECT).eq('id', Number(id)).maybeSingle();
    if (error) throw error;
    return data ? toSpecialization(data as SpecialtyRow) : null;
  }

  async save(input: SpecializationInput): Promise<Specialization> {
    // The app reads `name` + `icon`; the rest are admin-only enrichment columns.
    const payload = {
      name: input.nameEn,
      name_ar: input.nameAr || input.nameEn,
      description: input.descEn || input.descAr || null,
      icon: input.icon,
      color: input.color,
      base_fee: input.baseFee,
    };
    const query = input.id
      ? this.db.from(TABLE).update(payload).eq('id', Number(input.id))
      : this.db.from(TABLE).insert(payload);
    const { data, error } = await query.select(SELECT).single();
    if (error) throw error;
    return toSpecialization(data as SpecialtyRow);
  }

  async delete(id: EntityId): Promise<void> {
    const { error } = await this.db.from(TABLE).delete().eq('id', Number(id));
    if (error) throw error;
  }
}
