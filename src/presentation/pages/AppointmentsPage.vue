<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import SearchBox from '@/presentation/components/ui/SearchBox.vue';
import FilterSelect from '@/presentation/components/ui/FilterSelect.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import { useAppointments } from '@/presentation/composables/useAppointments';
import { useI18n } from '@/presentation/composables/useI18n';
import { STATUS_VARIANT } from '@/presentation/components/ui/statusMap';
import { AppointmentStatus } from '@/domain/enums';
import { formatMoney, formatNumber, formatDate, formatTime } from '@/shared/utils/format';
import type { SelectOption } from '@/presentation/components/ui/types';

const { t, locale, pick } = useI18n();
const appts = useAppointments();

onMounted(() => appts.load());

const SUMMARY_STATUSES = [
  AppointmentStatus.Confirmed,
  AppointmentStatus.Pending,
  AppointmentStatus.Completed,
  AppointmentStatus.Cancelled,
];

const cityOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('filterCity')}` },
  ...appts.cities.value.map((c) => ({ value: c, label: appts.cityLabel(c) })),
]);
const doctorOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('filterDoctor')}` },
  ...appts.doctors.value.map((d) => ({ value: d, label: appts.doctorLabel(d) })),
]);
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('filterStatus')}` },
  ...['completed', 'confirmed', 'pending', 'cancelled'].map((s) => ({ value: s, label: t.value(s) })),
]);
</script>

<template>
  <div>
    <div class="toolbar">
      <SearchBox v-model="appts.filters.search" :placeholder="t('search')" />
      <FilterSelect v-model="appts.filters.city" :options="cityOptions" />
      <FilterSelect v-model="appts.filters.doctor" :options="doctorOptions" />
      <FilterSelect v-model="appts.filters.status" :options="statusOptions" />
      <BaseButton v-if="appts.hasFilter.value" variant="ghost" small @click="appts.clear()">
        <AppIcon name="x" :size="15" />{{ t('clearFilters') }}
      </BaseButton>
      <div class="spacer" />
      <BaseButton variant="ghost" @click="appts.exportCsv()">
        <AppIcon name="download" :size="17" />{{ t('exportCsv') }}
      </BaseButton>
    </div>

    <div class="card">
      <div class="card-head" style="gap: 18px; flex-wrap: wrap">
        <span class="fw6" style="font-size: 14.5px">
          {{ formatNumber(appts.filtered.value.length, locale) }} {{ t('results') }}
        </span>
        <div style="display: flex; gap: 8px; margin-inline-start: auto; flex-wrap: wrap">
          <span v-for="st in SUMMARY_STATUSES" :key="st" class="badge" :class="STATUS_VARIANT[st]">
            <span class="bdot" />{{ t(st) }} · {{ formatNumber(appts.counts.value[st] ?? 0, locale) }}
          </span>
        </div>
      </div>

      <LoadingState v-if="appts.loading.value && !appts.items.value.length" />
      <ErrorState v-else-if="appts.error.value" :message="appts.error.value" @retry="appts.load()" />
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{ t('patient') }}</th>
              <th>{{ t('doctor') }}</th>
              <th>{{ t('specialization') }}</th>
              <th>{{ t('city') }}</th>
              <th>{{ t('dateTime') }}</th>
              <th style="text-align: end">{{ t('price') }}</th>
              <th>{{ t('status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in appts.filtered.value" :key="a.id">
              <td>
                <div class="cell-main">
                  <AppAvatar :name="pick(a.patientEn, a.patientAr)" :color="a.patientColor" :size="36" />
                  <span class="cell-name">{{ pick(a.patientEn, a.patientAr) }}</span>
                </div>
              </td>
              <td>
                <div class="cell-name" style="font-weight: 500">{{ pick(a.doctorEn, a.doctorAr) }}</div>
                <div class="cell-sub">{{ pick(a.clinicEn, a.clinicAr) }}</div>
              </td>
              <td><span class="tag">{{ pick(a.specializationEn, a.specializationAr) }}</span></td>
              <td class="txt-2">{{ pick(a.cityEn, a.cityAr) }}</td>
              <td>
                <div class="num fw6" style="font-size: 13.5px">{{ formatDate(a.datetime, locale) }}</div>
                <div class="cell-sub num">{{ formatTime(a.datetime, locale) }}</div>
              </td>
              <td class="num fw6" style="text-align: end">{{ formatMoney(a.price, locale) }}</td>
              <td><StatusBadge :status="a.status" /></td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!appts.filtered.value.length" icon="appointments" />
      </div>
    </div>
  </div>
</template>
