import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/presentation/stores/dashboard.store';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export function useDashboard() {
  const store = useDashboardStore();
  const { data, loading, error } = storeToRefs(store);
  const service = container.resolve(TOKENS.DashboardService);

  const appointments = computed(() => data.value?.appointments ?? []);
  const recent = computed(() => service.recentBookings(appointments.value));
  const activity = computed(() => service.todayActivity(appointments.value));
  const statusCounts = computed(() => service.statusCounts(appointments.value));

  return {
    data,
    loading,
    error,
    stats: computed(() => data.value?.stats ?? null),
    activeDoctors: computed(() => data.value?.activeDoctors ?? 0),
    recent,
    activity,
    statusCounts,
    totalAppointments: computed(() => appointments.value.length),
    load: () => store.load(),
  };
}
