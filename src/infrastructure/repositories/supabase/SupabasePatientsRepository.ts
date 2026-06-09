import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { Patient } from '@/domain/entities/Patient';
import type { EntityId } from '@/shared/types';
import { PatientStatus } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toPatient } from '@/infrastructure/mappers/patient.mapper';
import type { PatientRow } from '@/infrastructure/supabase/types';

const SELECT = 'id, name_en, name_ar, email, phone, total_bookings, status, joined, last_visit, color';

export class SupabasePatientsRepository implements IPatientsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Patient[]> {
    const { data, error } = await this.db.from('patients').select(SELECT).order('joined');
    if (error) throw error;
    return ((data ?? []) as PatientRow[]).map(toPatient);
  }

  async getById(id: EntityId): Promise<Patient | null> {
    const { data, error } = await this.db.from('patients').select(SELECT).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? toPatient(data as PatientRow) : null;
  }

  async setBlocked(id: EntityId, blocked: boolean): Promise<Patient> {
    const { data, error } = await this.db
      .from('patients')
      .update({ status: blocked ? PatientStatus.Blocked : PatientStatus.Active })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return toPatient(data as PatientRow);
  }
}
