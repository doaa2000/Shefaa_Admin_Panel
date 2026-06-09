<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/presentation/composables/useI18n';

const props = defineProps<{ status: string }>();
const { t } = useI18n();

/** Maps a domain status string to a badge color variant (from the design). */
const STATUS_MAP: Record<string, string> = {
  active: 'ok',
  inactive: 'neutral',
  blocked: 'danger',
  completed: 'ok',
  confirmed: 'info',
  pending: 'warn',
  cancelled: 'danger',
};

const variant = computed(() => STATUS_MAP[props.status] ?? 'neutral');
</script>

<template>
  <span class="badge" :class="variant">
    <span class="bdot" />{{ t(status) }}
  </span>
</template>
