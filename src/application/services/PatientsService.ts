import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { Patient } from '@/domain/entities/Patient';
import { PatientStatus } from '@/domain/enums';

export class PatientsService {
  constructor(private readonly repo: IPatientsRepository) {}

  getAll(): Promise<Patient[]> {
    return this.repo.list();
  }

  /** Blocks an active patient or unblocks a blocked one. */
  toggleBlocked(patient: Patient): Promise<Patient> {
    return this.repo.setBlocked(patient.id, patient.status !== PatientStatus.Blocked);
  }
}
