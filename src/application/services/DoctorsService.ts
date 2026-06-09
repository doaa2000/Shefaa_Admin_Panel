import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';
import { DoctorStatus } from '@/domain/enums';

/**
 * Application service for doctors. Holds the use-case orchestration and keeps
 * the UI free of business rules. Depends only on the repository abstraction.
 */
export class DoctorsService {
  constructor(private readonly repo: IDoctorsRepository) {}

  getAll(): Promise<Doctor[]> {
    return this.repo.list();
  }

  getById(id: EntityId): Promise<Doctor | null> {
    return this.repo.getById(id);
  }

  save(input: DoctorInput): Promise<Doctor> {
    return this.repo.save(input);
  }

  remove(id: EntityId): Promise<void> {
    return this.repo.delete(id);
  }

  /** Toggles a doctor between active and inactive. */
  toggleStatus(doctor: Doctor): Promise<Doctor> {
    return this.repo.setStatus(doctor.id, doctor.status !== DoctorStatus.Active);
  }
}
