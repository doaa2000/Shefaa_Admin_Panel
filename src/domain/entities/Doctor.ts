import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';

/** A practitioner assigned to a clinic and specialization. */
export interface Doctor {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  email: string;
  specializationId: EntityId;
  specialtyEn: string;
  specialtyAr: string;
  clinicId: EntityId;
  clinicEn: string;
  clinicAr: string;
  cityEn: string;
  cityAr: string;
  govEn: string;
  govAr: string;
  fee: number;
  status: DoctorStatus;
  color: string;
}

/** Payload accepted by the doctors service when creating/editing. */
export interface DoctorInput {
  id?: EntityId;
  nameEn: string;
  nameAr: string;
  email: string;
  specializationId: EntityId;
  clinicId: EntityId;
  fee: number;
  status: DoctorStatus;
}
