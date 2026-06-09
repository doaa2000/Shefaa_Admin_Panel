<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import BaseButton from './BaseButton.vue';
import { useI18n } from '@/presentation/composables/useI18n';

defineProps<{ message?: string }>();
const emit = defineEmits<{ retry: [] }>();
const { t } = useI18n();
</script>

<template>
  <div class="empty">
    <div class="ico" style="color: var(--danger); background: var(--danger-soft)">
      <AppIcon name="x" :size="28" />
    </div>
    <h4>{{ t('errorTitle') }}</h4>
    <p>{{ message || t('errorMsg') }}</p>
    <div style="margin-top: 16px">
      <BaseButton variant="ghost" small @click="emit('retry')">{{ t('retry') }}</BaseButton>
    </div>
  </div>
</template>
