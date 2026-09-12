<script setup lang="ts">
import AppIcon from './AppIcon.vue';

withDefaults(
  defineProps<{
    icon: string;
    title?: string;
    tone?: 'default' | 'ok' | 'danger';
    size?: number;
    disabled?: boolean;
  }>(),
  { title: '', tone: 'default', size: 16, disabled: false },
);
</script>

<template>
  <button
    class="act"
    :class="{ ok: tone === 'ok', danger: tone === 'danger' }"
    :title="title"
    :disabled="disabled"
  >
    <AppIcon :name="icon" :size="size" />
  </button>
</template>
