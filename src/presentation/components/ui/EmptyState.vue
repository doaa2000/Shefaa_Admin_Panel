<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useI18n } from '@/presentation/composables/useI18n';

withDefaults(defineProps<{ icon?: string }>(), { icon: 'search' });
const { t } = useI18n();
</script>

<template>
  <div class="empty">
    <div class="ico"><AppIcon :name="icon" :size="28" /></div>
    <h4>{{ t('noResults') }}</h4>
    <p>{{ t('noResultsMsg') }}</p>
  </div>
</template>
