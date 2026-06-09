import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { Locale, TextDirection } from '@/shared/types';
import { translate, directionOf } from '@/providers/i18n';

const LANG_KEY = 'shefaa.lang';

/** Global UI state: language/direction and mobile navigation. */
export const useUiStore = defineStore('ui', () => {
  const locale = ref<Locale>((localStorage.getItem(LANG_KEY) as Locale) || 'en');
  const mobileNavOpen = ref(false);

  const dir = computed<TextDirection>(() => directionOf(locale.value));

  /** Translation function bound to the current locale. */
  const t = computed(() => (key: string) => translate(locale.value, key));

  function setLocale(next: Locale): void {
    locale.value = next;
  }

  function toggleMobileNav(): void {
    mobileNavOpen.value = !mobileNavOpen.value;
  }

  function closeMobileNav(): void {
    mobileNavOpen.value = false;
  }

  // Reflect language onto <html> and persist.
  watch(
    locale,
    (lang) => {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = directionOf(lang);
    },
    { immediate: true },
  );

  return { locale, dir, mobileNavOpen, t, setLocale, toggleMobileNav, closeMobileNav };
});
