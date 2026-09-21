import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import { assertDeleted, describeWriteError } from './writeGuards';
import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toDoctor } from '@/infrastructure/mappers/doctor.mapper';
import type { DoctorCredentials } from '@/domain/entities/Doctor';
import { loadRefMaps } from './loadRefs';
import type { DoctorRow } from '@/infrastructure/supabase/types';

const TABLE = 'Doctors';
const SELECT =
  'id, name, specialty_id, specialization, clinic_id, consultation_fee, status, email, image, title, user_id';

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
    if (error) throw await describeWriteError(error, this.db);
    await assertDeleted(data, 'The doctor', this.db);
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

  /**
   * Asks the `doctor-account` function for this clinic's login.
   *
   * It runs on Supabase rather than here because making an account needs the
   * service role key, which bypasses every policy in the database. This panel
   * is a web page: whatever it holds, every visitor holds. So the key stays on
   * that side, and we send the admin's own token for it to check.
   */
  async issueAccount(id: EntityId, action: 'create' | 'reset'): Promise<DoctorCredentials> {
    const { data, error } = await this.db.functions.invoke('doctor-account', {
      body: { action, doctor_id: Number(id) },
    });

    if (error) {
      // invoke() reports any non-2xx as a generic FunctionsHttpError, so the
      // reason the function gave is in the response body rather than in the
      // error -- fetched here so the page can say which of the refusals it was.
      let code: string | undefined;
      const res = (error as { context?: Response }).context;
      if (res && typeof res.json === 'function') {
        try {
          code = ((await res.json()) as { error?: string }).error;
        } catch {
          /* no body, or not json: fall through to the generic message */
        }
      }
      throw new Error(code ?? error.message);
    }

    const answer = data as { ok?: boolean; email?: string; password?: string; error?: string };
    if (!answer?.ok || !answer.password) throw new Error(answer?.error ?? 'account_failed');

    return { email: answer.email ?? '', password: answer.password };
  }
}
