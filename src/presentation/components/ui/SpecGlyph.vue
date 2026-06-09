<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

const props = withDefaults(
  defineProps<{ icon: string; color: string; size?: number; box?: number }>(),
  { size: 38, box: 38 },
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
