import type { EntityId } from '@/shared/types';
import { AppointmentStatus } from '@/domain/enums';

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
}
