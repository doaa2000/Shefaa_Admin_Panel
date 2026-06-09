import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePatientsStore } from '@/presentation/stores/patients.store';
import { useAppointmentsStore } from '@/presentation/stores/appointments.store';
import { useI18n } from './useI18n';
import type { Patient } from '@/domain/entities/Patient';

export function usePatients() {
  const store = usePatientsStore();
  const apptStore = useAppointmentsStore();
  const { items, loading, error } = storeToRefs(store);
  const { locale } = useI18n();

  const search = ref('');
  const statusFilter = ref('');

  const filtered = computed<Patient[]>(() => {
    const q = search.value.trim();
    const ql = q.toLowerCase();
    return items.value.filter((p) => {
      const name = locale.value === 'ar' ? p.nameAr : p.nameEn;
      const matchQ =
        !q ||
        name.includes(q) ||
        p.nameEn.toLowerCase().includes(ql) ||
        p.phone.includes(q) ||
        p.email.includes(ql);
      return matchQ && (!statusFilter.value || p.status === statusFilter.value);
    });
  });

  const appointmentsOf = (patient: Patient) =>
    apptStore.items.filter((a) => a.patientEn === patient.nameEn).slice(0, 5);

  async function load(): Promise<void> {
    await Promise.all([store.fetchAll(), apptStore.fetchAll()]);
  }

  return {
    items,
    filtered,
    loading,
    error,
    search,
    statusFilter,
    appointmentsOf,
    load,
    toggleBlocked: store.toggleBlocked,
  };
}
