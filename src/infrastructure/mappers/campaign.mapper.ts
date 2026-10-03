import type { Campaign, CampaignStatus } from '@/domain/entities/Campaign';
import type { CampaignRow } from '@/infrastructure/supabase/types';

const STATUSES: CampaignStatus[] = ['draft', 'announced', 'postponed', 'cancelled'];

/** campaigns → domain. Nulls become empty strings: the form binds to inputs,
 *  and an input holding null renders the word "null". */
export function toCampaign(row: CampaignRow): Campaign {
  return {
    id: String(row.id),
    title: row.title ?? '',
    body: row.body ?? '',
    imageUrl: row.image_url ?? '',
    governorateId: row.governorate_id == null ? '' : String(row.governorate_id),
    cityId: row.city_id == null ? '' : String(row.city_id),
    venue: row.venue ?? '',
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    // Postgres hands back seconds; every time field in this panel is HH:MM,
    // and a type="time" input rejects the longer form.
    startTime: (row.start_time ?? '').slice(0, 5),
    endTime: (row.end_time ?? '').slice(0, 5),
    status: STATUSES.includes(row.status as CampaignStatus)
      ? (row.status as CampaignStatus)
      : 'draft',
    round: row.round ?? 0,
    announcedAt: row.announced_at,
  };
}
