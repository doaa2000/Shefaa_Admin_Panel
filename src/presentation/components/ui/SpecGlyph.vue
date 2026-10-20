<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

// Specialties no longer carry a color of their own (the app never showed one),
// so every glyph is drawn in the panel's accent unless told otherwise.
const props = withDefaults(
  defineProps<{ icon: string; color?: string; size?: number; box?: number }>(),
  { color: '#4A93BC', size: 38, box: 38 },
);

const boxStyle = computed(() => ({
  width: `${props.box}px`,
  height: `${props.box}px`,
  background: props.color + '1F',
  color: props.color,
}));
</script>

<template>
  <div class="tree-ico" :style="boxStyle">
    <AppIcon :name="icon" :size="size * 0.5" />
  </div>
</template>
