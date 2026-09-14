<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import { useCommissionStore } from '@/presentation/stores/commission.store';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatMoney, formatNumber } from '@/shared/utils/format';

const { t, locale } = useI18n();
const store = useCommissionStore();
const { statement, loading, error, year, month } = storeToRefs(store);

onMounted(() => store.load());

const monthLabel = computed(() =>
  new Date(year.value, month.value, 1).toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : 'en-US',
    { month: 'long', year: 'numeric' },
  ),
);

/** There is nothing to look at in a month that has not started. */
const canGoForward = computed(() => {
  const now = new Date();
  return year.value < now.getFullYear() || month.value < now.getMonth();
});

const money = (value: number) => formatMoney(value, locale.value);
const count = (value: number) => formatNumber(value, locale.value);

const cards = computed(() => {
  const totals = statement.value?.totals;
  if (!totals) return [];
  return [
    { key: 'commission', label: t.value('commissionDue'), value: money(totals.commission), icon: 'cash', bg: 'var(--ok-soft)', fg: 'var(--ok)' },
    { key: 'fees', label: t.value('commissionFees'), value: money(totals.fees), icon: 'trendUp', bg: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
    { key: 'bookings', label: t.value('commissionBookings'), value: count(totals.bookings), icon: 'calendar', bg: 'var(--purple-soft)', fg: 'var(--purple)' },
    { key: 'cancelled', label: t.value('commissionCancelled'), value: count(totals.cancelled), icon: 'x', bg: 'var(--warn-soft)', fg: 'var(--warn)' },
  ];
});
</script>

<template>
  <div>
    <div class="toolbar">
      <!-- Worded, not arrowed: an arrow for "the month before" points one way
           in Arabic and the other in English, and the label is right in both. -->
      <BaseButton variant="soft" small @click="store.step(-1)">
        {{ t('commissionPrevMonth') }}
      </BaseButton>
      <strong style="font-size: 15px">{{ monthLabel }}</strong>
      <BaseButton variant="soft" small :disabled="!canGoForward" @click="store.step(1)">
        {{ t('commissionNextMonth') }}
      </BaseButton>
      <div class="spacer" />
      <span class="muted" style="font-size: 13px">{{ t('commissionBasis') }}</span>
    </div>

    <LoadingState v-if="loading && !statement" />
    <ErrorState v-else-if="error" :message="error" @retry="store.load()" />

    <template v-else-if="statement">
      <div class="stat-grid">
        <div v-for="card in cards" :key="card.key" class="stat">
          <div class="stat-ico" :style="{ background: card.bg, color: card.fg }">
            <AppIcon :name="card.icon" :size="22" />
          </div>
          <div class="stat-val">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>

      <!-- Said out loud rather than folded in: bookings taken before there was
           a share carry none, and a total that quietly excluded them without
           saying so would look like a shortfall. -->
      <p v-if="statement.totals.unrated > 0" class="muted" style="font-size: 13px; margin: 10px 2px">
        {{ t('commissionUnrated').replace('{count}', count(statement.totals.unrated)) }}
      </p>

      <div class="card">
        <EmptyState v-if="statement.rows.length === 0" icon="cash" />
        <table v-else class="tbl">
          <thead>
            <tr>
              <th>{{ t('doctor') }}</th>
              <th style="text-align: center">{{ t('commissionBookings') }}</th>
              <th style="text-align: end">{{ t('commissionFees') }}</th>
              <th style="text-align: end">{{ t('commissionDue') }}</th>
              <th style="text-align: end">{{ t('commissionNet') }}</th>
              <th style="text-align: center">{{ t('commissionCancelled') }}</th>
              <th style="text-align: center">{{ t('commissionNoShow') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in statement.rows" :key="row.doctorId">
              <td>{{ row.doctorName }}</td>
              <td style="text-align: center">{{ count(row.bookings) }}</td>
              <td style="text-align: end">{{ money(row.fees) }}</td>
              <td style="text-align: end"><strong>{{ money(row.commission) }}</strong></td>
              <td style="text-align: end" class="muted">{{ money(row.net) }}</td>
              <td style="text-align: center">
                {{ count(row.cancelled) }}
                <!-- A doctor cancelling their own bookings and a patient
                     changing their mind are different events, and only one of
                     them removes a charge the doctor owed. -->
                <span v-if="row.cancelledByDoctor > 0" class="badge warn">
                  {{ t('commissionByDoctor').replace('{count}', count(row.cancelledByDoctor)) }}
                </span>
              </td>
              <td style="text-align: center">
                {{ count(row.noShow) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
