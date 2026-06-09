<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppIcon from './AppIcon.vue';

defineProps<{ title?: string; subtitle?: string }>();
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
  <div class="panel-overlay" @mousedown="onOverlay">
    <div class="panel">
      <div class="panel-head">
        <slot name="head">
          <div>
            <h2 style="margin: 0; font-size: 19px; font-weight: 700">{{ title }}</h2>
            <p v-if="subtitle" style="margin: 3px 0 0; font-size: 13px; color: var(--text-3)">
              {{ subtitle }}
            </p>
          </div>
        </slot>
        <button class="icon-btn modal-x" style="width: 36px; height: 36px" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>
      <div class="panel-body"><slot /></div>
      <div v-if="$slots.footer" class="panel-foot"><slot name="footer" /></div>
    </div>
  </div>
</template>
