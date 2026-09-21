<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useI18n } from '@/presentation/composables/useI18n';

// `title` and `body` are i18n keys, not text, so a caller stays translated.
// Without them this says "no results, adjust your search" -- right for a list
// somebody filtered, wrong for a day on which nothing has happened yet.
withDefaults(
  defineProps<{ icon?: string; title?: string; body?: string }>(),
  { icon: 'search', title: 'noResults', body: 'noResultsMsg' },
);
const { t } = useI18n();
</script>

<template>
  <div class="empty">
    <div class="ico"><AppIcon :name="icon" :size="28" /></div>
    <h4>{{ t(title) }}</h4>
    <p>{{ t(body) }}</p>
  </div>
</template>
