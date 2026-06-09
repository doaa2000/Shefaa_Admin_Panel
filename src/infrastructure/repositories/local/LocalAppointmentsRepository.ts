import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

export class LocalAppointmentsRepository implements IAppointmentsRepository {
  list(): Promise<Appointment[]> {
    return delay(localDb.read('appointments'));
  }

  async getById(id: EntityId): Promise<Appointment | null> {
    return delay(localDb.read('appointments').find((a) => a.id === id) ?? null);
  }
}
