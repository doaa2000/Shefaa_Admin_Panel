import type { Appointment } from '@/domain/entities/Appointment';
import type { EntityId } from '@/shared/types';

export interface IAppointmentsRepository {
  list(): Promise<Appointment[]>;
  getById(id: EntityId): Promise<Appointment | null>;
}
