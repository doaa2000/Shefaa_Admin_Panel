import type { EntityId } from '@/shared/types';
import { PatientStatus } from '@/domain/enums';

/** A registered patient / app user. */
export interface Patient {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  email: string;
  phone: string;
  totalBookings: number;
  status: PatientStatus;
  joined: string;
  lastVisit: string;
  color: string;
}
