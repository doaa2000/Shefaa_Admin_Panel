import type { EntityId } from '@/shared/types';

/** The authenticated administrator. */
export interface Admin {
  id: EntityId;
  nameEn: string;
  nameAr: string;
  email: string;
  role: string;
}

/** Credentials passed to the auth service. */
export interface Credentials {
  email: string;
  password: string;
}
