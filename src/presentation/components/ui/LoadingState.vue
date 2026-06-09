<script setup lang="ts">
import { useI18n } from '@/presentation/composables/useI18n';
const { t } = useI18n();
</script>

<template>
  <div class="empty">
    <div class="spinner" style="margin: 0 auto 16px" />
    <p>{{ t('loading') }}</p>
  </div>
</template>
