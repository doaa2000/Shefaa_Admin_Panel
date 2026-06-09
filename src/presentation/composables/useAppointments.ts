import { computed, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppointmentsStore } from '@/presentation/stores/appointments.store';
import { useI18n } from './useI18n';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';
import type { AppointmentFilters } from '@/application/services/AppointmentsService';

export function useAppointments() {
  const store = useAppointmentsStore();
  const { items, loading, error } = storeToRefs(store);
  const { locale } = useI18n();
  const service = container.resolve(TOKENS.AppointmentsService);

  const filters = reactive<AppointmentFilters>({ search: '', city: '', doctor: '', status: '' });

  const filtered = computed(() => service.applyFilters(items.value, filters));
  const cities = computed(() => service.distinctCities(items.value));
  const doctors = computed(() => service.distinctDoctors(items.value));
  const counts = computed(() => service.countByStatus(filtered.value));

  const hasFilter = computed(
    () => !!(filters.search || filters.city || filters.doctor || filters.status),
  );

  function clear(): void {
    filters.search = '';
    filters.city = '';
    filters.doctor = '';
    filters.status = '';
  }

  /** Label for a city filter value, resolved for the active language. */
  function cityLabel(cityEn: string): string {
    const a = items.value.find((x) => x.cityEn === cityEn);
    return locale.value === 'ar' ? (a ? a.cityAr : cityEn) : cityEn;
  }
  function doctorLabel(doctorEn: string): string {
    const a = items.value.find((x) => x.doctorEn === doctorEn);
    return locale.value === 'ar' ? (a ? a.doctorAr : doctorEn) : doctorEn;
  }

  function exportCsv(): void {
    const csv = service.toCsv(filtered.value);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    items,
    loading,
    error,
    filters,
    filtered,
    cities,
    doctors,
    counts,
    hasFilter,
    clear,
    cityLabel,
    doctorLabel,
    exportCsv,
    load: () => store.fetchAll(),
  };
}
