import type { ICampaignsRepository } from '@/domain/repositories/ICampaignsRepository';
import type { AnnounceResult, Campaign, CampaignInput, CampaignStatus } from '@/domain/entities/Campaign';
import type { EntityId } from '@/shared/types';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { toCampaign } from '@/infrastructure/mappers/campaign.mapper';
import type { CampaignRow } from '@/infrastructure/supabase/types';
import { assertDeleted, describeWriteError } from './writeGuards';

const TABLE = 'campaigns';
// The same bucket as the banners: one convoy picture is a banner picture, and
// a second bucket would need a second set of policies to keep in step.
const BUCKET = 'banners';
// One literal, not two joined with `+`: the client infers the row shape from
// the select string, and a concatenation is just `string` to it -- which makes
// every read come back as GenericStringError.
// prettier-ignore
const SELECT = 'id, title, body, image_url, governorate_id, city_id, venue, starts_on, ends_on, start_time, end_time, status, round, announced_at';

export class SupabaseCampaignsRepository implements ICampaignsRepository {
  private db = getSupabaseClient();

  async list(): Promise<Campaign[]> {
    // Drafts and finished convoys are listed here on purpose: this is where
    // they are written and where last month's are looked up. Only the app
    // filters, and the policy does that filtering.
    const { data, error } = await this.db
      .from(TABLE)
      .select(SELECT)
      .order('starts_on', { ascending: false })
      .order('id', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as CampaignRow[]).map(toCampaign);
  }

  async save(input: CampaignInput): Promise<Campaign> {
    const payload = {
      title: input.title.trim(),
      body: input.body.trim(),
      image_url: input.imageUrl || null,
      // Empty means national, and the database reads null as national.
      governorate_id: input.governorateId === '' ? null : Number(input.governorateId),
      city_id: input.cityId === '' ? null : Number(input.cityId),
      venue: input.venue.trim() || null,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      status: input.status,
    };
    const query = input.id
      ? this.db.from(TABLE).update(payload).eq('id', Number(input.id))
      : this.db.from(TABLE).insert(payload);
    const { data, error } = await query.select(SELECT).single();
    if (error) throw await describeWriteError(error, this.db);
    return toCampaign(data as CampaignRow);
  }

  async delete(id: EntityId): Promise<void> {
    // Counted, not assumed: row level security reports a refused delete as a
    // clean delete of nothing. See writeGuards.
    const { data, error } = await this.db
      .from(TABLE)
      .delete()
      .eq('id', Number(id))
      .select('id');
    if (error) throw await describeWriteError(error, this.db);
    await assertDeleted(data, 'The convoy', this.db);
  }

  async announce(id: EntityId): Promise<AnnounceResult> {
    const { data, error } = await this.db.rpc('announce_campaign', {
      p_campaign: Number(id),
    });
    if (error) throw await describeWriteError(error, this.db);
    const row = (data ?? {}) as Record<string, unknown>;
    return {
      status: (row.status as CampaignStatus) ?? 'announced',
      round: Number(row.round ?? 0),
      addressed: Number(row.addressed ?? 0),
    };
  }

  async uploadImage(file: File): Promise<string> {
    // A name of our own, never the one the file arrived with: uploads keep
    // spaces, Arabic letters and duplicates, and any of the three turns into a
    // broken URL or an overwritten picture.
    const dot = file.name.lastIndexOf('.');
    const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : 'jpg';
    const path = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await this.db.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', contentType: file.type || undefined });
    if (error) throw await describeWriteError(error, this.db);

    return this.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
}
