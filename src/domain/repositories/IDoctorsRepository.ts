import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { DoctorCredentials } from '@/domain/entities/Doctor';
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

  /**
   * Makes the login this doctor signs in with, or replaces its password.
   *
   * Returns the password once. It is not stored anywhere it can be read back,
   * so a password that is lost is replaced rather than recovered.
   */
  issueAccount(id: EntityId, action: 'create' | 'reset'): Promise<DoctorCredentials>;
}
