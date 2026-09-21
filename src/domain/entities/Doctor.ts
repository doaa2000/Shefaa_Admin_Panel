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
  /**
   * Whether a login exists for this clinic yet.
   *
   * The account is a separate thing from this row, and until one is made the
   * doctor cannot open the dashboard at all. The list shows it because a
   * clinic that is registered but cannot be signed into looks finished and is
   * not.
   */
  hasAccount: boolean;
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

/** Shown once, right after it is made. Never read back. */
export interface DoctorCredentials {
  email: string;
  password: string;
}
