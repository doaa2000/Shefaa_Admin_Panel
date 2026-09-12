import type { Banner } from '@/domain/entities/Banner';
import type { BannerRow } from '@/infrastructure/supabase/types';

/** banners (id, image_url, title, subtitle, sort_order, is_active) → domain */
export function toBanner(row: BannerRow): Banner {
  return {
    id: String(row.id),
    imageUrl: row.image_url ?? '',
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? false,
  };
}
