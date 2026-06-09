import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';

export class SpecializationsService {
  constructor(private readonly repo: ISpecializationsRepository) {}

  getAll(): Promise<Specialization[]> {
    return this.repo.list();
  }

  getById(id: EntityId): Promise<Specialization | null> {
    return this.repo.getById(id);
  }

  save(input: SpecializationInput): Promise<Specialization> {
    return this.repo.save(input);
  }

  remove(id: EntityId): Promise<void> {
    return this.repo.delete(id);
  }
}
