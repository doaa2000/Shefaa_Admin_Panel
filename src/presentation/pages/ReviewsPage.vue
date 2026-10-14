<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import FilterSelect from '@/presentation/components/ui/FilterSelect.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import type { SelectOption } from '@/presentation/components/ui/types';
import { useReviewsStore } from '@/presentation/stores/reviews.store';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatDate, formatNumber } from '@/shared/utils/format';

const { t, locale } = useI18n();
const store = useReviewsStore();

const doctor = ref('');
const stars = ref('');
/** Most reviews are stars alone; the notes are what an admin comes to read. */
const notes = ref('');

onMounted(() => store.fetchAll(true));

const doctorOptions = computed<SelectOption[]>(() => {
  const seen = new Map<string, string>();
  for (const r of store.items) seen.set(String(r.doctorId), r.doctorName || t.value('doctor'));
  return [
    { value: '', label: `${t.value('all')} — ${t.value('filterDoctor')}` },
    ...[...seen].map(([value, label]) => ({ value, label })),
  ];
});
const starOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('reviewStars')}` },
  ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: '★'.repeat(n) })),
]);
const noteOptions = computed<SelectOption[]>(() => [
  { value: '', label: t.value('reviewAllRows') },
  { value: 'with', label: t.value('reviewWithNote') },
]);

const filtered = computed(() =>
  store.items.filter(
    (r) =>
      (!doctor.value || String(r.doctorId) === doctor.value) &&
      (!stars.value || String(r.stars) === stars.value) &&
      (!notes.value || r.comment !== null),
  ),
);
</script>

<template>
  <div>
    <div class="toolbar">
      <FilterSelect v-model="doctor" :options="doctorOptions" />
      <FilterSelect v-model="stars" :options="starOptions" />
      <FilterSelect v-model="notes" :options="noteOptions" />
    </div>

    <div class="card">
      <div class="card-head" style="gap: 18px; flex-wrap: wrap">
        <span class="fw6" style="font-size: 14.5px">
          {{ formatNumber(filtered.length, locale) }} {{ t('results') }}
        </span>
        <!-- Said where the notes are read, so nobody wonders who else can. -->
        <span class="muted" style="font-size: 12.5px">{{ t('reviewPrivacy') }}</span>
      </div>

      <LoadingState v-if="store.loading && !store.items.length" />
      <ErrorState v-else-if="store.error" :message="store.error" @retry="store.fetchAll(true)" />
      <EmptyState
        v-else-if="!filtered.length"
        icon="sparkle"
        :title="store.items.length ? 'noResults' : 'reviewNoneTitle'"
        :body="store.items.length ? 'noResultsMsg' : 'reviewNoneBody'"
      />
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{ t('doctor') }}</th>
              <th>{{ t('patient') }}</th>
              <th>{{ t('reviewStars') }}</th>
              <th>{{ t('reviewNote') }}</th>
              <th>{{ t('filterDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td class="cell-name">{{ r.doctorName || '—' }}</td>
              <td>{{ r.patientName || '—' }}</td>
              <td style="color: #f0b429; white-space: nowrap" :title="`${r.stars} / 5`">
                {{ '★'.repeat(r.stars) }}<span style="color: #cbd5e1">{{ '★'.repeat(5 - r.stars) }}</span>
              </td>
              <td style="min-width: 220px; max-width: 420px; white-space: pre-line">
                <span v-if="r.comment">{{ r.comment }}</span>
                <span v-else class="muted">—</span>
              </td>
              <td class="num" style="white-space: nowrap">{{ formatDate(r.createdAt, locale) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
