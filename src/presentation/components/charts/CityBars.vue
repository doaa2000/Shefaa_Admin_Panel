<script setup lang="ts">
import { computed } from 'vue';
import type { CityBookings } from '@/domain/entities/DashboardStats';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatNumber } from '@/shared/utils/format';
import { shade } from '@/shared/utils/color';

const props = defineProps<{ data: CityBookings[] }>();
const { locale } = useI18n();

const colors = ['#67B2D8', '#4A93BC', '#7B6FCB', '#5A8FB0'];
const max = computed(() => Math.max(...props.data.map((d) => d.value)));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 18px; padding-top: 4px">
    <div v-for="(d, i) in data" :key="i">
      <div style="display: flex; justify-content: space-between; margin-bottom: 7px">
        <span style="font-size: 13.5px; font-weight: 600">{{ locale === 'ar' ? d.ar : d.en }}</span>
        <span class="num" style="font-size: 13.5px; font-weight: 700; color: var(--text-2)">
          {{ formatNumber(d.value, locale) }}
        </span>
      </div>
      <div style="height: 10px; background: var(--surface-2); border-radius: 99px; overflow: hidden">
        <div
          :style="{
            width: `${(d.value / max) * 100}%`,
            height: '100%',
            borderRadius: '99px',
            background: `linear-gradient(90deg, ${colors[i % 4]}, ${shade(colors[i % 4], 18)})`,
            transition: 'width .6s cubic-bezier(.16,1,.3,1)',
          }"
        />
      </div>
    </div>
  </div>
</template>
