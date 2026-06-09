<script setup lang="ts">
import { computed } from 'vue';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger-soft';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    small?: boolean;
    block?: boolean;
    type?: 'button' | 'submit';
    disabled?: boolean;
  }>(),
  { variant: 'primary', small: false, block: false, type: 'button', disabled: false },
);

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  { 'btn-sm': props.small, 'btn-block': props.block },
]);
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
