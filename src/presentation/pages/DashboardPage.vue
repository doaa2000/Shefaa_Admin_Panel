<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import BarChart from '@/presentation/components/charts/BarChart.vue';
import CityBars from '@/presentation/components/charts/CityBars.vue';
import DonutChart from '@/presentation/components/charts/DonutChart.vue';
import { useDashboard } from '@/presentation/composables/useDashboard';
import { useI18n } from '@/presentation/composables/useI18n';
import {
  formatMoney,
  formatNumber,
  formatPercent,
  formatDateShort,
  formatTime,
} from '@/shared/utils/format';

const { t, locale, pick } = useI18n();
const dash = useDashboard();

onMounted(() => dash.load());

const months = computed(() =>
  locale.value === 'ar' ? dash.stats.value?.trend.monthsAr ?? [] : dash.stats.value?.trend.monthsEn ?? [],
);

interface Card {
  key: string;
  label: string;
  value: string;
  trend: number;
  icon: string;
  bg: string;
  fg: string;
}

const cards = computed<Card[]>(() => {
  const s = dash.stats.value;
  if (!s) return [];
  return [
    { key: 'bookings', label: t.value('stat_bookings'), value: formatNumber(s.bookings.value, locale.value), trend: s.bookings.trend, icon: 'calendar', bg: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
    { key: 'doctors', label: t.value('stat_doctors'), value: formatNumber(dash.activeDoctors.value, locale.value), trend: s.doctors.trend, icon: 'stethoscope', bg: 'var(--purple-soft)', fg: 'var(--purple)' },
    { key: 'revenue', label: t.value('stat_revenue'), value: formatMoney(s.revenue.value, locale.value), trend: s.revenue.trend, icon: 'cash', bg: 'var(--ok-soft)', fg: 'var(--ok)' },
    { key: 'patients', label: t.value('stat_patients'), value: formatNumber(s.patients.value, locale.value), trend: s.patients.trend, icon: 'heart', bg: 'var(--warn-soft)', fg: 'var(--warn)' },
  ];
});

const statusRows = ['confirmed', 'pending', 'completed'] as const;
const donutValue = computed(
  () => (dash.statusCounts.value.completed ?? 0) + (dash.statusCounts.value.confirmed ?? 0),
);
</script>

<template>
  <LoadingState v-if="dash.loading.value && !dash.data.value" />
  <ErrorState v-else-if="dash.error.value" :message="dash.error.value" @retry="dash.load()" />
  <div v-else-if="dash.stats.value">
    <!-- Stat cards -->
    <div class="stat-grid">
      <div v-for="card in cards" :key="card.key" class="stat">
        <div class="stat-ico" :style="{ background: card.bg, color: card.fg }">
          <AppIcon :name="card.icon" :size="22" />
        </div>
        <div class="stat-val">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
        <div class="stat-trend" :class="card.trend >= 0 ? 'up' : 'down'">
          <AppIcon :name="card.trend >= 0 ? 'arrowUp' : 'arrowDn'" :size="13" />
          {{ formatPercent(card.trend, locale) }}%
          <span class="lbl">{{ t('vsLast') }}</span>
        </div>
      </div>
    </div>

    <!-- Mid: trend + city -->
    <div class="dash-mid">
      <div class="card">
        <div class="card-head">
          <div style="flex: 1">
            <h3>{{ t('bookings_trend') }}</h3>
            <div class="sub">{{ t('bookings_trend_sub') }}</div>
          </div>
          <span class="badge info"><span class="bdot" />+18.7%</span>
        </div>
        <div class="card-pad">
          <BarChart :data="dash.stats.value.trend.values" :labels="months" />
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div style="flex: 1">
            <h3>{{ t('bookings_city') }}</h3>
            <div class="sub">{{ t('bookings_city_sub') }}</div>
          </div>
          <AppIcon name="pin" :size="18" class="muted" />
        </div>
        <div class="card-pad">
          <CityBars :data="dash.stats.value.byCity" />
        </div>
      </div>
    </div>

    <!-- Bottom: activity + recent -->
    <div class="dash-bot">
      <div class="card">
        <div class="card-head">
          <div style="flex: 1">
            <h3>{{ t('today_activity') }}</h3>
            <div class="sub">{{ t('today_sub') }}</div>
          </div>
          <span style="width: 9px; height: 9px; border-radius: 99px; background: var(--ok); box-shadow: 0 0 0 3px var(--ok-soft)" />
        </div>
        <div class="card-pad" style="padding-top: 6px">
          <div
            style="display: flex; align-items: center; gap: 18px; padding-bottom: 16px; margin-bottom: 6px; border-bottom: 1px dashed var(--border)"
          >
            <DonutChart :value="donutValue" :total="dash.totalAppointments.value" />
            <div style="display: grid; gap: 8px; flex: 1">
              <div
                v-for="st in statusRows"
                :key="st"
                style="display: flex; align-items: center; justify-content: space-between"
              >
                <StatusBadge :status="st" />
                <span class="num fw6">{{ formatNumber(dash.statusCounts.value[st] ?? 0, locale) }}</span>
              </div>
            </div>
          </div>
          <div class="activity">
            <div v-for="a in dash.activity.value" :key="a.id" class="act-item">
              <div class="act-time">{{ formatTime(a.datetime, locale) }}</div>
              <div class="act-line">
                <div class="act-title">{{ pick(a.patientEn, a.patientAr) }}</div>
                <div class="act-sub">
                  {{ t('with') }} {{ pick(a.doctorEn, a.doctorAr) }} ·
                  {{ pick(a.specializationEn, a.specializationAr) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div style="flex: 1">
            <h3>{{ t('recent_bookings') }}</h3>
            <div class="sub">{{ t('recent_sub') }}</div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>{{ t('patient') }}</th>
                <th>{{ t('doctor') }}</th>
                <th>{{ t('city') }}</th>
                <th>{{ t('date') }}</th>
                <th style="text-align: end">{{ t('price') }}</th>
                <th>{{ t('status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in dash.recent.value" :key="a.id">
                <td>
                  <div class="cell-main">
                    <AppAvatar :name="pick(a.patientEn, a.patientAr)" :color="a.patientColor" :size="34" />
                    <span class="cell-name">{{ pick(a.patientEn, a.patientAr) }}</span>
                  </div>
                </td>
                <td class="txt-2">{{ pick(a.doctorEn, a.doctorAr) }}</td>
                <td class="txt-2">{{ pick(a.cityEn, a.cityAr) }}</td>
                <td class="num txt-2">{{ formatDateShort(a.datetime, locale) }}</td>
                <td class="num fw6" style="text-align: end">{{ formatMoney(a.price, locale) }}</td>
                <td><StatusBadge :status="a.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
