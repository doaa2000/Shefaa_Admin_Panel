import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { Patient } from '@/domain/entities/Patient';
import type { EntityId } from '@/shared/types';
import { PatientStatus } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toPatient } from '@/infrastructure/mappers/patient.mapper';
import type { ProfileRow, BookingRow } from '@/infrastructure/supabase/types';

const TABLE = 'profiles';
const SELECT = 'id, name, phone, gender, status';

export class SupabasePatientsRepository implements IPatientsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Patient[]> {
    const [profiles, bookings] = await Promise.all([
      this.db.from(TABLE).select(SELECT),
      this.db.from('bookings').select('id, patient_id'),
    ]);
    if (profiles.error) throw profiles.error;
    if (bookings.error) throw bookings.error;

    // Tally bookings per patient for the "total bookings" column.
    const counts = new Map<string, number>();
    for (const b of (bookings.data ?? []) as BookingRow[]) {
      if (b.patient_id) counts.set(b.patient_id, (counts.get(b.patient_id) ?? 0) + 1);
    }
    return ((profiles.data ?? []) as ProfileRow[]).map((row, i) =>
      toPatient(row, counts.get(row.id) ?? 0, i),
    );
  }

  async getById(id: EntityId): Promise<Patient | null> {
    const { data, error } = await this.db.from(TABLE).select(SELECT).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? toPatient(data as ProfileRow) : null;
  }

  async setBlocked(id: EntityId, blocked: boolean): Promise<Patient> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ status: blocked ? PatientStatus.Blocked : PatientStatus.Active })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return toPatient(data as ProfileRow);
  }
}
