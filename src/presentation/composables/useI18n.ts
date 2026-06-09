import { storeToRefs } from 'pinia';
import { useUiStore } from '@/presentation/stores/ui.store';
import type { Locale } from '@/shared/types';

/** Thin composable exposing localization to components. */
export function useI18n() {
  const ui = useUiStore();
  const { locale, dir, t } = storeToRefs(ui);

  /** Pick the language-appropriate string from a bilingual pair. */
  function pick(en: string, ar: string): string {
    return locale.value === 'ar' ? ar : en;
  }

  function setLocale(next: Locale): void {
    ui.setLocale(next);
  }

  return { locale, dir, t, pick, setLocale };
}
