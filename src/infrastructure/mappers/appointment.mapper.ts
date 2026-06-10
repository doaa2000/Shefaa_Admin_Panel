import type { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';
import type { RefMaps } from './doctor.mapper';
import type {
  BookingRow,
  DoctorRow,
  ProfileRow,
  PaymentRow,
} from '@/infrastructure/supabase/types';

const STATUS: Record<string, AppointmentStatus> = {
  completed: AppointmentStatus.Completed,
  confirmed: AppointmentStatus.Confirmed,
  pending: AppointmentStatus.Pending,
  cancelled: AppointmentStatus.Cancelled,
  canceled: AppointmentStatus.Cancelled,
};

export interface BookingRefs extends RefMaps {
  doctors: Map<number, DoctorRow>;
  patients: Map<string, ProfileRow>;
  payments: Map<number, PaymentRow>;
}

/** bookings row + lookup maps → domain Appointment. */
export function toAppointment(row: BookingRow, refs: BookingRefs, index = 0): Appointment {
  const doc = row.doctor_id != null ? refs.doctors.get(row.doctor_id) : undefined;
  const sp = doc?.specialty_id != null ? refs.specialties.get(doc.specialty_id) : undefined;
  const clinic = doc?.clinic_id != null ? refs.clinics.get(doc.clinic_id) : undefined;
  const city = clinic?.city_id != null ? refs.cities.get(clinic.city_id) : undefined;
  const gov = city?.governorate_id != null ? refs.governorates.get(city.governorate_id) : undefined;
  const patient = row.patient_id ? refs.patients.get(row.patient_id) : undefined;
  const payment = row.payment_id != null ? refs.payments.get(row.payment_id) : undefined;

  const datetime = row.booked_date
    ? `${row.booked_date}T${row.start_time ?? '00:00:00'}`
    : new Date().toISOString();

  return {
    id: String(row.id),
    patientEn: patient?.name ?? '—',
    patientAr: patient?.name ?? '—',
    patientColor: colorAt(index + 2),
    doctorEn: doc?.name ?? '—',
    doctorAr: doc?.name ?? '—',
    doctorColor: colorAt(index),
    specializationEn: sp?.name ?? doc?.specialization ?? '',
    specializationAr: sp?.name_ar ?? sp?.name ?? '',
    cityEn: city?.name ?? '',
    cityAr: city?.name ?? '',
    govEn: gov?.name ?? '',
    govAr: gov?.name ?? '',
    clinicEn: clinic?.name ?? '',
    clinicAr: clinic?.name ?? '',
    datetime,
    price: payment?.amount ?? doc?.consultation_fee ?? 0,
    status: STATUS[(row.status ?? '').toLowerCase()] ?? AppointmentStatus.Pending,
  };
}
