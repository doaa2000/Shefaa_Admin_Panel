import type { IPatientsRepository } from '@/domain/repositories/IPatientsRepository';
import type { Patient } from '@/domain/entities/Patient';
import type { EntityId } from '@/shared/types';
import { PatientStatus } from '@/domain/enums';
import { localDb, delay } from './LocalDatabase';

export class LocalPatientsRepository implements IPatientsRepository {
  list(): Promise<Patient[]> {
    return delay(localDb.read('patients'));
  }

  async getById(id: EntityId): Promise<Patient | null> {
    return delay(localDb.read('patients').find((p) => p.id === id) ?? null);
  }

  async setBlocked(id: EntityId, blocked: boolean): Promise<Patient> {
    const patients = localDb.read('patients').map((p) =>
      p.id === id ? { ...p, status: blocked ? PatientStatus.Blocked : PatientStatus.Active } : p,
    );
    localDb.write('patients', patients);
    return delay(patients.find((p) => p.id === id)!);
  }
}
