<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ value: number; total: number; color?: string; size?: number }>(),
  { color: '#67B2D8', size: 76 },
);

const r = computed(() => (props.size - 12) / 2);
const c = computed(() => 2 * Math.PI * r.value);
const pct = computed(() => (props.total ? props.value / props.total : 0));
</script>

<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
    <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="#EEF2F5" stroke-width="9" />
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="r"
      fill="none"
      :stroke="color"
      stroke-width="9"
      stroke-linecap="round"
      :stroke-dasharray="c"
      :stroke-dashoffset="c * (1 - pct)"
      :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      style="transition: stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
    />
    <text
      x="50%"
      y="50%"
      dominant-baseline="central"
      text-anchor="middle"
      :font-size="size * 0.26"
      font-weight="700"
      fill="#1F2933"
    >
      {{ Math.round(pct * 100) }}%
    </text>
  </svg>
</template>
