import type { Patient } from '@/domain/entities/Patient';
import type { EntityId } from '@/shared/types';

export interface IPatientsRepository {
  list(): Promise<Patient[]>;
  getById(id: EntityId): Promise<Patient | null>;
  setBlocked(id: EntityId, blocked: boolean): Promise<Patient>;
}
