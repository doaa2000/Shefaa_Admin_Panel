import type { Locale, TextDirection } from '@/shared/types';
import { en } from './locales/en';
import { ar } from './locales/ar';

export type Dictionary = Record<string, string>;

export const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

/** Resolve a translation key for a locale, falling back to English then the key. */
export function translate(lang: Locale, key: string): string {
  const dict = DICTIONARIES[lang];
  if (dict[key] !== undefined) return dict[key];
  if (en[key] !== undefined) return en[key];
  return key;
}

export function directionOf(lang: Locale): TextDirection {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
