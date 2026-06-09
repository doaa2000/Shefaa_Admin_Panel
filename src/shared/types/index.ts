/**
 * Cross-cutting types shared by every layer.
 * These are framework- and backend-agnostic.
 */

/** Supported UI languages. */
export type Locale = 'en' | 'ar';

export type TextDirection = 'ltr' | 'rtl';

/** A bilingual string carried throughout the domain. */
export interface Localized {
  en: string;
  ar: string;
}

/** Generic identifier type — abstracted so the backend can change it freely. */
export type EntityId = string;

/** Result of a paginated query. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Standard query options passed from composables down to repositories. */
export interface QueryOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}
