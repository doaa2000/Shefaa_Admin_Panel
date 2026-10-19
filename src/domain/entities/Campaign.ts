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
  /** Narrower still, within that governorate. Only the people who picked this
   *  city in the app are told (0070), and those who have not picked one yet
   *  but have booked there. */
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
  /**
   * How many people the convoy is for at all, told before or not. With
   * `addressed` at zero it is what separates "nobody to tell" from "everybody
   * was told already". Null from a database without 0070, which does not
   * report it.
   */
  audience: number | null;
}

/** Why somebody a convoy was announced to did not get the notification. */
export type MissedReason = 'no_device' | 'failed';

export interface MissedPerson {
  userId: string;
  /** Empty when the account never gave one. */
  name: string;
  phone: string;
  reason: MissedReason;
}

/**
 * Who an announced convoy reached, counted by `campaign_delivery` (0070).
 *
 * Everybody a notification was written for across every announcement of the
 * convoy, each counted once, by their latest one. `told` is the sum of the
 * other four.
 */
export interface CampaignDelivery {
  told: number;
  /** At least one of their phones received it. */
  delivered: number;
  /** No phone registered for notifications: it is in their list in the app,
   *  and nothing buzzed. Most of the people missed are these. */
  noDevice: number;
  /** Their phones refused it, after the sender's retries. */
  failed: number;
  /** Not sent yet. The sender runs once a minute, so this is a wait, not a
   *  fault. */
  pending: number;
  /** The no-device and failed people by name, capped at 200 by the server. */
  missed: MissedPerson[];
}
