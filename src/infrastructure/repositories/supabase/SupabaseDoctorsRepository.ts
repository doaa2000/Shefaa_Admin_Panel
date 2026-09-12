import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import { assertDeleted, describeWriteError } from './writeGuards';
import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toDoctor } from '@/infrastructure/mappers/doctor.mapper';
import { loadRefMaps } from './loadRefs';
import type { DoctorRow } from '@/infrastructure/supabase/types';

const TABLE = 'Doctors';
const SELECT = 'id, name, specialty_id, specialization, clinic_id, consultation_fee, status, email, image, title';

export class SupabaseDoctorsRepository implements IDoctorsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Doctor[]> {
    const [refs, res] = await Promise.all([
      loadRefMaps(this.db),
      this.db.from(TABLE).select(SELECT).order('id', { ascending: false }),
    ]);
    if (res.error) throw res.error;
    return ((res.data ?? []) as DoctorRow[]).map((row, i) => toDoctor(row, refs, i));
  }

  async getById(id: EntityId): Promise<Doctor | null> {
    const [refs, res] = await Promise.all([
      loadRefMaps(this.db),
      this.db.from(TABLE).select(SELECT).eq('id', Number(id)).maybeSingle(),
    ]);
    if (res.error) throw res.error;
    return res.data ? toDoctor(res.data as DoctorRow, refs) : null;
  }

  async save(input: DoctorInput): Promise<Doctor> {
    // Single-language `name` in the app DB → use the English value.
    const payload = {
      name: input.nameEn,
      specialty_id: input.specializationId ? Number(input.specializationId) : null,
      clinic_id: input.clinicId ? Number(input.clinicId) : null,
      consultation_fee: input.fee,
      status: input.status,
      email: input.email || null,
    };
    const query = input.id
      ? this.db.from(TABLE).update(payload).eq('id', Number(input.id))
      : this.db.from(TABLE).insert(payload);
    const [refs, res] = await Promise.all([loadRefMaps(this.db), query.select(SELECT).single()]);
    if (res.error) throw res.error;
    return toDoctor(res.data as DoctorRow, refs);
  }

  async delete(id: EntityId): Promise<void> {
    // Counted, not assumed: row level security reports a refused delete as a
    // clean delete of nothing. See writeGuards.
    const { data, error } = await this.db
      .from(TABLE)
      .delete()
      .eq('id', Number(id))
      .select('id');
    if (error) throw describeWriteError(error);
    assertDeleted(data, 'The doctor');
  }

  async setStatus(id: EntityId, active: boolean): Promise<Doctor> {
    const [refs, res] = await Promise.all([
      loadRefMaps(this.db),
      this.db
        .from(TABLE)
        .update({ status: active ? DoctorStatus.Active : DoctorStatus.Inactive })
        .eq('id', Number(id))
        .select(SELECT)
        .single(),
    ]);
    if (res.error) throw res.error;
    return toDoctor(res.data as DoctorRow, refs);
  }
}
