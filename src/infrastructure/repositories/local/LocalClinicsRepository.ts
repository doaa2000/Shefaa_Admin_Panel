import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { ClinicInput, Governorate, LocationChain } from '@/domain/entities/Location';
import { LocationLevel } from '@/domain/enums';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

export class LocalClinicsRepository implements IClinicsRepository {
  listTree(): Promise<Governorate[]> {
    return delay(localDb.read('locations'));
  }

  async addNode(
    level: LocationLevel,
    nameEn: string,
    nameAr: string,
    parent: LocationChain,
  ): Promise<Governorate[]> {
    const tree = localDb.read('locations');
    const id = level[0] + Date.now();
    const ar = nameAr || nameEn;

    if (level === LocationLevel.Governorate) {
      tree.push({ id, nameEn, nameAr: ar, cities: [] });
    } else if (level === LocationLevel.City) {
      const g = tree.find((x) => x.id === parent.gov);
      g?.cities.push({ id, nameEn, nameAr: ar, clinics: [] });
    } else if (level === LocationLevel.Clinic) {
      const g = tree.find((x) => x.id === parent.gov);
      const c = g?.cities.find((x) => x.id === parent.city);
      c?.clinics.push({ id, nameEn, nameAr: ar });
    }

    localDb.write('locations', tree);
    return delay(tree);
  }

  async deleteNode(level: LocationLevel, ids: LocationChain): Promise<Governorate[]> {
    let tree = localDb.read('locations');

    if (level === LocationLevel.Governorate) {
      tree = tree.filter((g) => g.id !== ids.gov);
    } else if (level === LocationLevel.City) {
      const g = tree.find((x) => x.id === ids.gov);
      if (g) g.cities = g.cities.filter((c) => c.id !== ids.city);
    } else if (level === LocationLevel.Clinic) {
      const g = tree.find((x) => x.id === ids.gov);
      const c = g?.cities.find((x) => x.id === ids.city);
      if (c) c.clinics = c.clinics.filter((cl) => cl.id !== ids.clinic);
    }

    localDb.write('locations', tree);
    return delay(tree);
  }

  async saveClinic(input: ClinicInput): Promise<{ tree: Governorate[]; clinicId: EntityId }> {
    const tree = localDb.read('locations');
    const city = tree.flatMap((g) => g.cities).find((c) => c.id === input.cityId);
    if (!city) throw new Error('City not found');

    const nameEn = input.nameEn.trim() || input.nameAr.trim();
    const clinic = {
      id: input.id ?? 'cl' + Date.now(),
      nameEn,
      nameAr: input.nameAr.trim() || nameEn,
      address: input.address.trim(),
    };

    const at = city.clinics.findIndex((x) => x.id === clinic.id);
    if (at >= 0) {
      city.clinics[at] = clinic;
    } else {
      // New, or moved from another city: taken out of wherever it was first.
      for (const g of tree) for (const c of g.cities) c.clinics = c.clinics.filter((x) => x.id !== clinic.id);
      city.clinics.push(clinic);
    }

    localDb.write('locations', tree);
    return delay({ tree, clinicId: clinic.id });
  }
}
