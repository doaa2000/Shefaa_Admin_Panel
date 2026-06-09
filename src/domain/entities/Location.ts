import type { EntityId } from '@/shared/types';

/** Leaf node: a clinic belonging to a city. */
export interface Clinic {
  id: EntityId;
  nameEn: string;
  nameAr: string;
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
