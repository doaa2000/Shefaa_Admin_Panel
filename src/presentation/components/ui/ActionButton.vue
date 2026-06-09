<script setup lang="ts">
import AppIcon from './AppIcon.vue';

withDefaults(
  defineProps<{
    icon: string;
    title?: string;
    tone?: 'default' | 'ok' | 'danger';
    size?: number;
  }>(),
  { title: '', tone: 'default', size: 16 },
);
</script>

<template>
  <button class="act" :class="{ ok: tone === 'ok', danger: tone === 'danger' }" :title="title">
    <AppIcon :name="icon" :size="size" />
  </button>
</template>
