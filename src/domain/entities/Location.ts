import type { EntityId } from '@/shared/types';

/** Leaf node: a clinic belonging to a city. */
export interface Clinic {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  /**
   * Street, building, landmark: what gets a patient to the door once they are
   * in the right city. Optional because clinics made before the panel asked
   * for it have none.
   */
  address?: string;
}

/** A city containing clinics. */
export interface City {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  clinics: Clinic[];
}

/** Top-level node: a governorate containing cities. */
export interface Governorate {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  cities: City[];
}

/** Identifies a node within the governorate → city → clinic hierarchy. */
export interface LocationChain {
  gov?: EntityId;
  city?: EntityId;
  clinic?: EntityId;
}

/** Creating a clinic, or changing one, from the panel. Without `id` it is new. */
export interface ClinicInput {
  id?: EntityId;
  cityId: EntityId;
  nameEn: string;
  nameAr: string;
  address: string;
}
