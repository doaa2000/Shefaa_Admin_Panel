import type { IClinicsRepository } from '@/domain/repositories/IClinicsRepository';
import type { Governorate, LocationChain } from '@/domain/entities/Location';
import type { Locale, EntityId } from '@/shared/types';
import { LocationLevel } from '@/domain/enums';

export interface FlatClinicOption {
  value: EntityId;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  govEn: string;
  govAr: string;
}

export class LocationsService {
  constructor(private readonly repo: IClinicsRepository) {}

  getTree(): Promise<Governorate[]> {
    return this.repo.listTree();
  }

  addNode(level: LocationLevel, nameEn: string, nameAr: string, parent: LocationChain) {
    return this.repo.addNode(level, nameEn, nameAr, parent);
  }

  deleteNode(level: LocationLevel, ids: LocationChain) {
    return this.repo.deleteNode(level, ids);
  }

  /** Flattens the tree into a clinic option list used by the doctor form. */
  flattenClinics(tree: Governorate[]): FlatClinicOption[] {
    const out: FlatClinicOption[] = [];
    for (const g of tree) {
      for (const c of g.cities) {
        for (const cl of c.clinics) {
          out.push({
            value: cl.id,
            nameEn: cl.nameEn,
            nameAr: cl.nameAr,
            cityEn: c.nameEn,
            cityAr: c.nameAr,
            govEn: g.nameEn,
            govAr: g.nameAr,
          });
        }
      }
    }
    return out;
  }

  clinicOptionLabel(opt: FlatClinicOption, lang: Locale): string {
    const clinic = lang === 'ar' ? opt.nameAr : opt.nameEn;
    const city = lang === 'ar' ? opt.cityAr : opt.cityEn;
    return `${clinic} · ${city}`;
  }
}
