import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toDoctor } from '@/infrastructure/mappers/doctor.mapper';
import type { DoctorRow } from '@/infrastructure/supabase/types';

const SELECT = `
  id, name_en, name_ar, email, fee, status, color, specialization_id, clinic_id,
  specialization:specializations ( name_en, name_ar ),
  clinic:clinics ( id, name_en, name_ar,
    city:cities ( id, name_en, name_ar,
      governorate:governorates ( id, name_en, name_ar ) ) )
`;

export class SupabaseDoctorsRepository implements IDoctorsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Doctor[]> {
    const { data, error } = await this.db
      .from('doctors')
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as DoctorRow[]).map(toDoctor);
  }

  async getById(id: EntityId): Promise<Doctor | null> {
    const { data, error } = await this.db.from('doctors').select(SELECT).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? toDoctor(data as unknown as DoctorRow) : null;
  }

  async save(input: DoctorInput): Promise<Doctor> {
    const payload = {
      name_en: input.nameEn.startsWith('Dr.') ? input.nameEn : 'Dr. ' + input.nameEn,
      name_ar: input.nameAr,
      email: input.email,
      specialization_id: input.specializationId,
      clinic_id: input.clinicId,
      fee: input.fee,
      status: input.status,
    };
    const query = input.id
      ? this.db.from('doctors').update(payload).eq('id', input.id)
      : this.db.from('doctors').insert(payload);
    const { data, error } = await query.select(SELECT).single();
    if (error) throw error;
    return toDoctor(data as unknown as DoctorRow);
  }

  async delete(id: EntityId): Promise<void> {
    const { error } = await this.db.from('doctors').delete().eq('id', id);
    if (error) throw error;
  }

  async setStatus(id: EntityId, active: boolean): Promise<Doctor> {
    const { data, error } = await this.db
      .from('doctors')
      .update({ status: active ? DoctorStatus.Active : DoctorStatus.Inactive })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return toDoctor(data as unknown as DoctorRow);
  }
}
