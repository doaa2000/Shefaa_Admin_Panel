import type { EntityId } from '@/shared/types';

/** A promotional image shown in the rotating carousel on the app's home screen. */
export interface Banner {
  id: EntityId;
  /** Public URL of the picture. */
  imageUrl: string;
  /** Optional heading drawn over the picture. */
  title: string;
  /** Optional line under the heading. */
  subtitle: string;
  /** Position in the carousel; lower comes first. */
  sortOrder: number;
  /** Hidden banners stay on file but never reach the app. */
  isActive: boolean;
}

/** Payload accepted when creating or updating a banner. */
export interface BannerInput {
  id?: EntityId;
  imageUrl: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
}
