import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toSpecialization } from '@/infrastructure/mappers/specialization.mapper';
import type { SpecializationRow } from '@/infrastructure/supabase/types';

const SELECT = 'id, name_en, name_ar, desc_en, desc_ar, icon, color, base_fee';

export class SupabaseSpecializationsRepository implements ISpecializationsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Specialization[]> {
    const { data, error } = await this.db.from('specializations').select(SELECT).order('name_en');
    if (error) throw error;
    return ((data ?? []) as SpecializationRow[]).map(toSpecialization);
  }

  async getById(id: EntityId): Promise<Specialization | null> {
    const { data, error } = await this.db
      .from('specializations')
      .select(SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? toSpecialization(data as SpecializationRow) : null;
  }

  async save(input: SpecializationInput): Promise<Specialization> {
    const payload = {
      name_en: input.nameEn,
      name_ar: input.nameAr || input.nameEn,
      desc_en: input.descEn,
      desc_ar: input.descAr || input.descEn,
      icon: input.icon,
      color: input.color,
      base_fee: input.baseFee,
    };
    const query = input.id
      ? this.db.from('specializations').update(payload).eq('id', input.id)
      : this.db.from('specializations').insert(payload);
    const { data, error } = await query.select(SELECT).single();
    if (error) throw error;
    return toSpecialization(data as SpecializationRow);
  }

  async delete(id: EntityId): Promise<void> {
    const { error } = await this.db.from('specializations').delete().eq('id', id);
    if (error) throw error;
  }
}
