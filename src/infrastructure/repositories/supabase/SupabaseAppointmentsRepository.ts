import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toAppointment, type BookingRefs } from '@/infrastructure/mappers/appointment.mapper';
import { loadRefMaps } from './loadRefs';
import type {
  BookingRow,
  DoctorRow,
  ProfileRow,
  PaymentRow,
} from '@/infrastructure/supabase/types';

const TABLE = 'bookings';
const SELECT = 'id, patient_id, doctor_id, payment_id, booked_date, start_time, status';

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

  async list(): Promise<Appointment[]> {
    const [refs, res] = await Promise.all([
      this.loadBookingRefs(),
      this.db.from(TABLE).select(SELECT).order('booked_date', { ascending: false }),
    ]);
    if (res.error) throw res.error;
    return ((res.data ?? []) as BookingRow[]).map((row, i) => toAppointment(row, refs, i));
  }

  async getById(id: EntityId): Promise<Appointment | null> {
    const [refs, res] = await Promise.all([
      this.loadBookingRefs(),
      this.db.from(TABLE).select(SELECT).eq('id', Number(id)).maybeSingle(),
    ]);
    if (res.error) throw res.error;
    return res.data ? toAppointment(res.data as BookingRow, refs) : null;
  }
}
