import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

/** A browser that cached the demo before bookings had an origin reads them
 *  back without one; they were all the app's. */
function withOrigin(a: Appointment): Appointment {
  return { ...a, origin: a.origin ?? 'app' };
}

export class LocalAppointmentsRepository implements IAppointmentsRepository {
  list(): Promise<Appointment[]> {
    return delay(localDb.read('appointments').map(withOrigin));
  }

  async getById(id: EntityId): Promise<Appointment | null> {
    const found = localDb.read('appointments').find((a) => a.id === id);
    return delay(found ? withOrigin(found) : null);
  }
}
