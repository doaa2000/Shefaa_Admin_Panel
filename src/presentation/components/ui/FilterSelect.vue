<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import type { SelectOption } from './types';

defineProps<{ modelValue: string; options: SelectOption[] }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="select-wrap">
    <select
      class="select"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <AppIcon name="chevD" :size="16" />
  </div>
</template>
