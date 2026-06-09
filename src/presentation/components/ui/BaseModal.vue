<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppIcon from './AppIcon.vue';

withDefaults(defineProps<{ title: string; subtitle?: string; wide?: boolean }>(), {
  subtitle: '',
  wide: false,
});
const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

function onOverlay(e: MouseEvent): void {
  if (e.target === e.currentTarget) emit('close');
}
</script>

<template>
  <div class="overlay" @mousedown="onOverlay">
    <div class="modal" :class="{ wide }">
      <div class="modal-head">
        <div>
          <h2>{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <button class="icon-btn modal-x" style="width: 36px; height: 36px" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>
      <div class="modal-body"><slot /></div>
      <div v-if="$slots.footer" class="modal-foot"><slot name="footer" /></div>
    </div>
  </div>
</template>
