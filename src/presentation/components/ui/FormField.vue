<script setup lang="ts">
defineProps<{
  label?: string;
  hint?: string;
  error?: string;
}>();
</script>

<template>
  <div class="field">
    <label v-if="label">{{ label }}</label>
    <slot />
    <div v-if="error" class="hint" style="color: var(--danger)">{{ error }}</div>
    <div v-else-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>
