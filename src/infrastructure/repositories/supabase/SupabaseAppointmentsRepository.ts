import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toAppointment, type BookingRefs } from '@/infrastructure/mappers/appointment.mapper';
import { loadRefMaps } from './loadRefs';
import { isMissingColumn } from './schemaGaps';
import type {
  BookingRow,
  DoctorRow,
  ProfileRow,
  PaymentRow,
} from '@/infrastructure/supabase/types';

const TABLE = 'bookings';
const SELECT = 'id, patient_id, doctor_id, payment_id, booked_date, start_time, status, origin, walk_in_name, walk_in_phone';
// What a database before 0061 has. Every booking on it came from the app, which
// is what the mapper assumes when `origin` is missing.
const SELECT_BEFORE_0061 = 'id, patient_id, doctor_id, payment_id, booked_date, start_time, status';

export class SupabaseAppointmentsRepository implements IAppointmentsRepository {
  private db = getSupabaseClient();

  /** Loads bookings plus the reference tables needed to resolve names/prices. */
  private async loadBookingRefs(): Promise<BookingRefs> {
    const base = await loadRefMaps(this.db);
    const [doctors, profiles, payments] = await Promise.all([
      this.db.from('Doctors').select('id, name, specialty_id, specialization, clinic_id, consultation_fee'),
      this.db.from('profiles').select('id, name, phone, gender, status'),
      this.db.from('payments').select('id, amount, status'),
    ]);
    if (doctors.error) throw doctors.error;
    if (profiles.error) throw profiles.error;
    if (payments.error) throw payments.error;
    return {
      ...base,
      doctors: new Map(((doctors.data ?? []) as DoctorRow[]).map((d) => [d.id, d])),
      patients: new Map(((profiles.data ?? []) as ProfileRow[]).map((p) => [p.id, p])),
      payments: new Map(((payments.data ?? []) as PaymentRow[]).map((p) => [p.id, p])),
    };
  }

  /** Reads bookings with the 0061 columns, and without them on a database
   *  that does not have them yet, rather than failing the whole page. */
  private async readBookings(id?: EntityId): Promise<BookingRow[]> {
    const run = (select: string) => {
      const q = this.db.from(TABLE).select(select);
      return id !== undefined
        ? q.eq('id', Number(id))
        : q.order('booked_date', { ascending: false });
    };
    let res = await run(SELECT);
    if (res.error && isMissingColumn(res.error)) res = await run(SELECT_BEFORE_0061);
    if (res.error) throw res.error;
    return (res.data ?? []) as unknown as BookingRow[];
  }

  async list(): Promise<Appointment[]> {
    const [refs, rows] = await Promise.all([this.loadBookingRefs(), this.readBookings()]);
    return rows.map((row, i) => toAppointment(row, refs, i));
  }

  async getById(id: EntityId): Promise<Appointment | null> {
    const [refs, rows] = await Promise.all([this.loadBookingRefs(), this.readBookings(id)]);
    return rows[0] ? toAppointment(rows[0], refs) : null;
  }
}
