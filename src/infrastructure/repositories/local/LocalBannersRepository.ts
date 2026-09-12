import type { IBannersRepository } from '@/domain/repositories/IBannersRepository';
import type { Banner, BannerInput } from '@/domain/entities/Banner';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

export class LocalBannersRepository implements IBannersRepository {
  list(): Promise<Banner[]> {
    const items = [...localDb.read('banners')].sort((a, b) => a.sortOrder - b.sortOrder);
    return delay(items);
  }

  async save(input: BannerInput): Promise<Banner> {
    const list = localDb.read('banners');
    const banner: Banner = {
      id: input.id ?? 'bn' + Date.now(),
      imageUrl: input.imageUrl,
      title: input.title,
      subtitle: input.subtitle,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    };
    const exists = list.some((b) => b.id === banner.id);
    const next = exists ? list.map((b) => (b.id === banner.id ? banner : b)) : [...list, banner];
    localDb.write('banners', next);
    return delay(banner);
  }

  async delete(id: EntityId): Promise<void> {
    localDb.write('banners', localDb.read('banners').filter((b) => b.id !== id));
    await delay(null);
  }

  /** No storage without a backend, so the picture is kept inline in the row. */
  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
  }
}
