import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { Governorate, LocationChain } from '@/domain/entities/Location';
import { LocationLevel } from '@/domain/enums';
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
}
