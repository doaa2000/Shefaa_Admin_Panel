import type { Locale } from '@/shared/types';

const localeTag = (lang: Locale): string => (lang === 'ar' ? 'ar-EG' : 'en-US');

/** Localized number formatting (Eastern Arabic numerals for `ar`). */
export function formatNumber(value: number, lang: Locale): string {
  return Number(value).toLocaleString(localeTag(lang));
}

/** Localized currency formatting in EGP, matching the design exactly. */
export function formatMoney(value: number, lang: Locale): string {
  const v = Number(value).toLocaleString(localeTag(lang));
  return lang === 'ar' ? `${v} ج.م` : `EGP ${v}`;
}

export function formatDate(iso: string, lang: Locale): string {
  return new Date(iso).toLocaleDateString(localeTag(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string, lang: Locale): string {
  return new Date(iso).toLocaleDateString(localeTag(lang), {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(iso: string, lang: Locale): string {
  return new Date(iso).toLocaleTimeString(localeTag(lang), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatPercent(value: number, lang: Locale): string {
  return Math.abs(value).toLocaleString(localeTag(lang), { minimumFractionDigits: 1 });
}
