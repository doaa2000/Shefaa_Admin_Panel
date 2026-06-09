import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';

/**
 * Contract for doctor persistence. The UI/application layers depend only on
 * this interface — never on a concrete backend (Supabase, REST, etc.).
 */
export interface IDoctorsRepository {
  list(): Promise<Doctor[]>;
  getById(id: EntityId): Promise<Doctor | null>;
  save(input: DoctorInput): Promise<Doctor>;
  delete(id: EntityId): Promise<void>;
  setStatus(id: EntityId, active: boolean): Promise<Doctor>;
}
