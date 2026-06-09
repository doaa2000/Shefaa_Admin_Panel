<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import BaseButton from './BaseButton.vue';
import { useI18n } from '@/presentation/composables/useI18n';

withDefaults(
  defineProps<{
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
  }>(),
  { confirmLabel: '', danger: true },
);
const emit = defineEmits<{ cancel: []; confirm: [] }>();
const { t } = useI18n();

function onOverlay(e: MouseEvent): void {
  if (e.target === e.currentTarget) emit('cancel');
}

const iconBoxStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 18px',
};
</script>

<template>
  <div class="overlay" @mousedown="onOverlay">
    <div class="modal" style="max-width: 420px">
      <div class="modal-body" style="text-align: center; padding-top: 32px">
        <div
          :style="{
            ...iconBoxStyle,
            background: danger ? 'var(--danger-soft)' : 'var(--accent-soft)',
            color: danger ? 'var(--danger)' : 'var(--accent-deep)',
          }"
        >
          <AppIcon name="trash" :size="26" />
        </div>
        <h2 style="margin: 0 0 8px; font-size: 19px">{{ title }}</h2>
        <p style="margin: 0; color: var(--text-3); font-size: 14px">{{ message }}</p>
      </div>
      <div class="modal-foot" style="justify-content: center">
        <BaseButton variant="ghost" @click="emit('cancel')">{{ t('cancel') }}</BaseButton>
        <BaseButton :variant="danger ? 'danger-soft' : 'primary'" @click="emit('confirm')">
          {{ confirmLabel || t('delete') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
