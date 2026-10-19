import type { ClinicInput, Governorate, LocationChain } from '@/domain/entities/Location';
import type { EntityId } from '@/shared/types';
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
  /**
   * Creates the clinic, or updates it when `input.id` is set, with its address.
   * Returns the tree as it now stands and the clinic's id, which a new clinic
   * only has once it is saved.
   */
  saveClinic(input: ClinicInput): Promise<{ tree: Governorate[]; clinicId: EntityId }>;
}
