import type { EntityId } from '@/shared/types';

/** Where a convoy is in its life. Only the middle two ever reach the app. */
export type CampaignStatus = 'draft' | 'announced' | 'postponed' | 'cancelled';

/**
 * A medical convoy, or any other announcement with a place and a date.
 *
 * Not a banner. The home carousel shows it, but everything that matters about
 * it is words -- which days, which hours, where, what it covers -- and words
 * burned into a picture cannot be read aloud, searched, or corrected without
 * a designer.
 */
export interface Campaign {
  id: EntityId;
  title: string;
  /** What it is, at length: specialties, whether it is free, what to bring. */
  body: string;
  /** Optional. A convoy announced in a hurry has no designed picture. */
  imageUrl: string;

  /** Empty means national: everyone with an account is told. */
  governorateId: EntityId | '';
  /** Narrower still, within that governorate. The audience is still read from
   *  the governorate, so a neighbouring city can still come. */
  cityId: EntityId | '';
  /** The address in words. A governorate is not somewhere anybody can go to. */
  venue: string;

  /** YYYY-MM-DD. A convoy may run for several days. */
  startsOn: string;
  endsOn: string;
  /** HH:MM, or empty for a convoy that runs until the queue is finished. */
  startTime: string;
  endTime: string;

  status: CampaignStatus;

  /** Announcements that actually went out. Zero means nobody has been told. */
  round: number;
  /** When the last one went out, or null. */
  announcedAt: string | null;
}

export type CampaignInput = Omit<Campaign, 'id' | 'round' | 'announcedAt'> & {
  id?: EntityId;
};

/** What `announce` reports back. */
export interface AnnounceResult {
  status: CampaignStatus;
  round: number;
  /**
   * How many people were newly told. Zero means everyone addressable had
   * already had this exact sentence -- the button was pressed twice -- which
   * the page says rather than claiming a second announcement.
   */
  addressed: number;
}
