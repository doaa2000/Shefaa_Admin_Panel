<script setup lang="ts">
import { storeToRefs } from 'pinia';
import AppIcon from './AppIcon.vue';
import { useToastStore } from '@/presentation/stores/toast.store';

const { toasts } = storeToRefs(useToastStore());

const ICON: Record<string, string> = { ok: 'check', danger: 'x', info: 'bell' };
</script>

<template>
  <div class="toast-wrap">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.variant">
      <span class="tico"><AppIcon :name="ICON[toast.variant]" :size="14" /></span>
      {{ toast.message }}
    </div>
  </div>
</template>
