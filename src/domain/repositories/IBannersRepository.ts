import type { Banner, BannerInput } from '@/domain/entities/Banner';
import type { EntityId } from '@/shared/types';

export interface IBannersRepository {
  list(): Promise<Banner[]>;
  save(input: BannerInput): Promise<Banner>;
  delete(id: EntityId): Promise<void>;
  /**
   * Stores the picture and returns the URL the app will load it from. Kept on
   * the repository because where the bytes live is a backend decision.
   */
  uploadImage(file: File): Promise<string>;
}
