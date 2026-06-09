/**
 * In-memory database with localStorage persistence. Backs the "local" provider
 * so the app is fully runnable without any backend configured. It mirrors the
 * behaviour of the original design's store.
 */
import type { Doctor } from '@/domain/entities/Doctor';
import type { Specialization } from '@/domain/entities/Specialization';
import type { Patient } from '@/domain/entities/Patient';
import type { Governorate } from '@/domain/entities/Location';
import type { Appointment } from '@/domain/entities/Appointment';
import {
  SEED_DOCTORS,
  SEED_SPECIALIZATIONS,
  SEED_PATIENTS,
  SEED_LOCATIONS,
  SEED_APPOINTMENTS,
} from '@/infrastructure/seed/seed-data';

interface DbShape {
  doctors: Doctor[];
  specializations: Specialization[];
  patients: Patient[];
  locations: Governorate[];
  appointments: Appointment[];
}

const STORE_KEY = 'shefaa.admin.v3';

function seed(): DbShape {
  return {
    doctors: structuredClone(SEED_DOCTORS),
    specializations: structuredClone(SEED_SPECIALIZATIONS),
    patients: structuredClone(SEED_PATIENTS),
    locations: structuredClone(SEED_LOCATIONS),
    appointments: structuredClone(SEED_APPOINTMENTS),
  };
}

class LocalDatabase {
  private data: DbShape;

  constructor() {
    this.data = this.load();
  }

  private load(): DbShape {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw) as DbShape;
    } catch {
      /* ignore malformed cache */
    }
    return seed();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch {
      /* storage may be unavailable; state still lives in memory */
    }
  }

  /** Returns a deep clone of a collection to keep callers from mutating state. */
  read<K extends keyof DbShape>(key: K): DbShape[K] {
    return structuredClone(this.data[key]);
  }

  write<K extends keyof DbShape>(key: K, value: DbShape[K]): void {
    this.data[key] = value;
    this.persist();
  }

  reset(): void {
    this.data = seed();
    this.persist();
  }
}

/** Singleton — the local backend is a single shared store. */
export const localDb = new LocalDatabase();

/** Simulates network latency so loading states are exercised in dev. */
export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
