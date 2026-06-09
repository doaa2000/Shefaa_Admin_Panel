import type { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type { AppointmentRow } from '@/infrastructure/supabase/types';

const STATUS: Record<string, AppointmentStatus> = {
  completed: AppointmentStatus.Completed,
  confirmed: AppointmentStatus.Confirmed,
  pending: AppointmentStatus.Pending,
  cancelled: AppointmentStatus.Cancelled,
};

export function toAppointment(row: AppointmentRow, index = 0): Appointment {
  const doctor = row.doctor;
  const clinic = doctor?.clinic ?? null;
  const city = clinic?.city ?? null;
  const gov = city?.governorate ?? null;
  return {
    id: row.id,
    patientEn: row.patient?.name_en ?? '',
    patientAr: row.patient?.name_ar ?? '',
    patientColor: row.patient?.color ?? colorAt(index + 2),
    doctorEn: doctor?.name_en ?? '',
    doctorAr: doctor?.name_ar ?? '',
    doctorColor: doctor?.color ?? colorAt(index),
    specializationEn: doctor?.specialization?.name_en ?? '',
    specializationAr: doctor?.specialization?.name_ar ?? '',
    cityEn: city?.name_en ?? '',
    cityAr: city?.name_ar ?? '',
    govEn: gov?.name_en ?? '',
    govAr: gov?.name_ar ?? '',
    clinicEn: clinic?.name_en ?? '',
    clinicAr: clinic?.name_ar ?? '',
    datetime: row.datetime,
    price: row.price,
    status: STATUS[row.status] ?? AppointmentStatus.Pending,
  };
}
