import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';

export interface ISpecializationsRepository {
  list(): Promise<Specialization[]>;
  getById(id: EntityId): Promise<Specialization | null>;
  save(input: SpecializationInput): Promise<Specialization>;
  delete(id: EntityId): Promise<void>;
}
