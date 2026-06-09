import type { Governorate, LocationChain } from '@/domain/entities/Location';
import type { LocationLevel } from '@/domain/enums';

/**
 * Manages the governorate → city → clinic hierarchy. Named `IClinicsRepository`
 * per the architecture brief; it owns the full location tree the clinics live in.
 */
export interface IClinicsRepository {
  listTree(): Promise<Governorate[]>;
  addNode(
    level: LocationLevel,
    nameEn: string,
    nameAr: string,
    parent: LocationChain,
  ): Promise<Governorate[]>;
  deleteNode(level: LocationLevel, ids: LocationChain): Promise<Governorate[]>;
}
