import type { ISpecializationsRepository } from '@/domain/repositories/ISpecializationsRepository';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

export class LocalSpecializationsRepository implements ISpecializationsRepository {
  list(): Promise<Specialization[]> {
    return delay(localDb.read('specializations'));
  }

  async getById(id: EntityId): Promise<Specialization | null> {
    return delay(localDb.read('specializations').find((s) => s.id === id) ?? null);
  }

  async save(input: SpecializationInput): Promise<Specialization> {
    const list = localDb.read('specializations');
    const spec: Specialization = {
      id: input.id ?? 'sp' + Date.now(),
      nameEn: input.nameEn,
      nameAr: input.nameAr || input.nameEn,
      descEn: input.descEn,
      descAr: input.descAr || input.descEn,
      icon: input.icon,
      color: input.color,
      baseFee: input.baseFee,
    };
    const exists = list.some((s) => s.id === spec.id);
    const next = exists ? list.map((s) => (s.id === spec.id ? spec : s)) : [...list, spec];
    localDb.write('specializations', next);
    return delay(spec);
  }

  async delete(id: EntityId): Promise<void> {
    localDb.write('specializations', localDb.read('specializations').filter((s) => s.id !== id));
    await delay(null);
  }
}
