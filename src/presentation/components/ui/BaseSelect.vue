<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import type { SelectOption } from './types';

defineProps<{
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div style="position: relative">
    <select
      class="sel"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <span
      style="
        position: absolute;
        inset-inline-end: 13px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--text-3);
      "
    >
      <AppIcon name="chevD" :size="16" />
    </span>
  </div>
</template>
