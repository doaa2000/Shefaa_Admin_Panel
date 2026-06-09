import type { EntityId } from '@/shared/types';

/** Medical specialization offered across the clinic network. */
export interface Specialization {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  /** Icon glyph key (see presentation icon registry). */
  icon: string;
  /** Brand color used for the glyph chip. */
  color: string;
  /** Typical consultation fee in EGP. */
  baseFee: number;
}

/** Payload accepted when creating or updating a specialization. */
export interface SpecializationInput {
  id?: EntityId;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  icon: string;
  color: string;
  baseFee: number;
}
