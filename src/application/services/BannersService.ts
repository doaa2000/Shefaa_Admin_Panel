import type { IBannersRepository } from '@/domain/repositories/IBannersRepository';
import type { Banner, BannerInput } from '@/domain/entities/Banner';
import type { EntityId } from '@/shared/types';

export class BannersService {
  constructor(private readonly repo: IBannersRepository) {}

  getAll(): Promise<Banner[]> {
    return this.repo.list();
  }

  save(input: BannerInput): Promise<Banner> {
    return this.repo.save(input);
  }

  remove(id: EntityId): Promise<void> {
    return this.repo.delete(id);
  }

  uploadImage(file: File): Promise<string> {
    return this.repo.uploadImage(file);
  }
}
