<script setup lang="ts">
import { computed } from 'vue';
import { getIcon } from './icons';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
    /** Fill color for solid glyphs (e.g. the brand heart). */
    fill?: string;
  }>(),
  { size: 20, fill: 'none' },
);

const def = computed(() => getIcon(props.name));
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="fill"
    stroke="currentColor"
    :stroke-width="def.sw ?? 1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="def.inner"
  />
</template>
