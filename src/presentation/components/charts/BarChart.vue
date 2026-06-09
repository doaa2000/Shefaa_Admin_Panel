<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatNumber } from '@/shared/utils/format';

const props = defineProps<{ data: number[]; labels: string[] }>();
const { locale } = useI18n();

const W = 560;
const H = 240;
const padL = 36;
const padB = 30;
const padT = 14;
const grid = 4;

const hover = ref<number | null>(null);

const max = computed(() => Math.max(...props.data) * 1.12);
const cw = computed(() => (W - padL) / props.data.length);
const bw = computed(() => Math.min(46, cw.value * 0.5));

const gridLines = computed(() =>
  Array.from({ length: grid + 1 }).map((_, i) => {
    const y = padT + (H - padT - padB) * (i / grid);
    const val = Math.round(max.value - (max.value * i) / grid);
    return { y, val };
  }),
);

const bars = computed(() =>
  props.data.map((v, i) => {
    const h = (H - padT - padB) * (v / max.value);
    const x = padL + cw.value * i + (cw.value - bw.value) / 2;
    const y = H - padB - h;
    return { v, i, h, x, y, label: props.labels[i] };
  }),
);
</script>

<template>
  <div style="position: relative">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" style="overflow: visible">
      <defs>
        <linearGradient id="barg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7DC0E2" />
          <stop offset="100%" stop-color="#67B2D8" />
        </linearGradient>
      </defs>
      <g v-for="(g, i) in gridLines" :key="'g' + i">
        <line :x1="padL" :y1="g.y" :x2="W" :y2="g.y" stroke="#EEF2F5" stroke-width="1" />
        <text :x="padL - 8" :y="g.y + 4" text-anchor="end" font-size="10.5" fill="#A8B2BC" font-weight="500">
          {{ g.val }}
        </text>
      </g>
      <g
        v-for="b in bars"
        :key="b.i"
        class="bar-col"
        @mouseenter="hover = b.i"
        @mouseleave="hover = null"
      >
        <rect :x="padL + cw * b.i" :y="padT" :width="cw" :height="H - padT - padB" fill="transparent" />
        <rect
          :x="b.x"
          :y="b.y"
          :width="bw"
          :height="b.h"
          rx="7"
          :fill="hover === b.i ? '#4A93BC' : 'url(#barg)'"
        />
        <text
          :x="padL + cw * b.i + cw / 2"
          :y="H - 8"
          text-anchor="middle"
          font-size="11.5"
          fill="#8A95A1"
          font-weight="600"
        >
          {{ b.label }}
        </text>
        <text
          v-if="hover === b.i"
          :x="padL + cw * b.i + cw / 2"
          :y="b.y - 9"
          text-anchor="middle"
          font-size="12.5"
          fill="#1F2933"
          font-weight="700"
        >
          {{ formatNumber(b.v, locale) }}
        </text>
      </g>
    </svg>
  </div>
</template>
