import type { IBannersRepository } from '@/domain/repositories/IBannersRepository';
import type { Banner, BannerInput } from '@/domain/entities/Banner';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toBanner } from '@/infrastructure/mappers/banner.mapper';
import type { BannerRow } from '@/infrastructure/supabase/types';
import { assertDeleted, describeWriteError } from './writeGuards';

const TABLE = 'banners';
const BUCKET = 'banners';
const SELECT = 'id, image_url, title, subtitle, sort_order, is_active';

export class SupabaseBannersRepository implements IBannersRepository {
  private db = getSupabaseClient();

  async list(): Promise<Banner[]> {
    // Inactive banners are listed here on purpose: the admin needs to see what
    // she has hidden. Only the app filters on is_active.
    const { data, error } = await this.db
      .from(TABLE)
      .select(SELECT)
      .order('sort_order')
      .order('id');
    if (error) throw error;
    return ((data ?? []) as BannerRow[]).map(toBanner);
  }

  async save(input: BannerInput): Promise<Banner> {
    const payload = {
      image_url: input.imageUrl,
      title: input.title || null,
      subtitle: input.subtitle || null,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    };
    const query = input.id
      ? this.db.from(TABLE).update(payload).eq('id', Number(input.id))
      : this.db.from(TABLE).insert(payload);
    const { data, error } = await query.select(SELECT).single();
    if (error) throw describeWriteError(error);
    return toBanner(data as BannerRow);
  }

  async delete(id: EntityId): Promise<void> {
    // Counted, not assumed: row level security reports a refused delete as a
    // clean delete of nothing. See writeGuards.
    const { data, error } = await this.db
      .from(TABLE)
      .delete()
      .eq('id', Number(id))
      .select('id');
    if (error) throw describeWriteError(error);
    assertDeleted(data, 'The banner');
  }

  async uploadImage(file: File): Promise<string> {
    // A name of our own, never the one the file arrived with: uploads keep
    // spaces, Arabic letters and duplicates, and any of the three turns into a
    // broken URL or an overwritten banner.
    const dot = file.name.lastIndexOf('.');
    const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await this.db.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', contentType: file.type || undefined });
    // The bucket has its own policies, so a picture can be refused for the same
    // reason a row can, and the raw message says as little.
    if (error) throw describeWriteError(error);

    return this.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
}
