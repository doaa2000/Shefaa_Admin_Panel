import type {
  AnnounceResult,
  Campaign,
  CampaignDelivery,
  CampaignInput,
} from '@/domain/entities/Campaign';
import type { EntityId } from '@/shared/types';

export interface ICampaignsRepository {
  list(): Promise<Campaign[]>;
  save(input: CampaignInput): Promise<Campaign>;
  delete(id: EntityId): Promise<void>;
  /**
   * Sends the announcement. Deliberately not part of `save`: an admin fixing
   * a spelling mistake must not push a notification to a governorate.
   */
  announce(id: EntityId): Promise<AnnounceResult>;
  /**
   * Who the announcements reached. Null when the database cannot say -- one
   * without 0070 -- which is different from a convoy that reached nobody.
   */
  delivery(id: EntityId): Promise<CampaignDelivery | null>;
  /** Stores the picture and returns the URL the app will load it from. */
  uploadImage(file: File): Promise<string>;
}
