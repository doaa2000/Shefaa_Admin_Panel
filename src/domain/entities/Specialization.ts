import type { EntityId } from '@/shared/types';

/**
 * Medical specialization offered across the clinic network.
 *
 * Only what the patient app shows: the name, in both languages, and the icon.
 * The table still has description, color and base_fee columns from an earlier
 * design; nothing reads them, so the panel no longer asks for them either.
 */
export interface Specialization {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  /** Icon glyph key (see presentation icon registry). */
  icon: string;
}

/** Payload accepted when creating or updating a specialization. */
export interface SpecializationInput {
  id?: EntityId;
  nameEn: string;
  nameAr: string;
  icon: string;
}
