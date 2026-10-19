import type { EntityId } from '@/shared/types';
import { AppointmentStatus } from '@/domain/enums';

/**
 * Where a booking came from. `app`: the patient booked it. `clinic`: the
 * clinic entered it for somebody who telephoned or walked in (0061), which
 * earns the platform nothing.
 */
export type BookingOrigin = 'app' | 'clinic';

/** A booking between a patient and a doctor. */
export interface Appointment {
  id: EntityId;
  patientEn: string;
  patientAr: string;
  patientColor: string;
  doctorEn: string;
  doctorAr: string;
  doctorColor: string;
  specializationEn: string;
  specializationAr: string;
  cityEn: string;
  cityAr: string;
  govEn: string;
  govAr: string;
  clinicEn: string;
  clinicAr: string;
  /** ISO 8601 timestamp. */
  datetime: string;
  price: number;
  status: AppointmentStatus;
  origin: BookingOrigin;
}
