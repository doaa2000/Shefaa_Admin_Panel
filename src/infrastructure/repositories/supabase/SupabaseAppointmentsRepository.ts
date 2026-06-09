import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toAppointment } from '@/infrastructure/mappers/appointment.mapper';
import type { AppointmentRow } from '@/infrastructure/supabase/types';

const SELECT = `
  id, datetime, price, status,
  patient:patients ( name_en, name_ar, color ),
  doctor:doctors ( name_en, name_ar, color,
    specialization:specializations ( name_en, name_ar ),
    clinic:clinics ( id, name_en, name_ar,
      city:cities ( id, name_en, name_ar,
        governorate:governorates ( id, name_en, name_ar ) ) ) )
`;

export class SupabaseAppointmentsRepository implements IAppointmentsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Appointment[]> {
    const { data, error } = await this.db
      .from('appointments')
      .select(SELECT)
      .order('datetime', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as AppointmentRow[]).map(toAppointment);
  }

  async getById(id: EntityId): Promise<Appointment | null> {
    const { data, error } = await this.db
      .from('appointments')
      .select(SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? toAppointment(data as unknown as AppointmentRow) : null;
  }
}
