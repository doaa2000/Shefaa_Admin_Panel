<script setup lang="ts">
import { computed } from 'vue';
import { shade } from '@/shared/utils/color';

const props = withDefaults(
  defineProps<{
    name: string;
    color: string;
    size?: number;
    square?: boolean;
    src?: string;
  }>(),
  { size: 38, square: false, src: '' },
);

const initials = computed(() =>
  (props.name || '')
    .replace(/^(Dr\.|د\.)\s*/, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join(''),
);

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${props.size * 0.38}px`,
  background: props.src ? 'none' : `linear-gradient(145deg, ${props.color}, ${shade(props.color, -14)})`,
}));
</script>

<template>
  <div class="avatar" :class="{ sq: square }" :style="style">
    <img v-if="src" :src="src" alt="" style="width: 100%; height: 100%; object-fit: cover" />
    <template v-else>{{ initials }}</template>
  </div>
</template>
