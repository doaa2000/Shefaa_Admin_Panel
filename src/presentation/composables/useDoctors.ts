import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDoctorsStore } from '@/presentation/stores/doctors.store';
import { useSpecializationsStore } from '@/presentation/stores/specializations.store';
import { useI18n } from './useI18n';
import type { Doctor } from '@/domain/entities/Doctor';

/** Page-level composable for the doctors module (list + filtering). */
export function useDoctors() {
  const store = useDoctorsStore();
  const specStore = useSpecializationsStore();
  const { items, loading, error } = storeToRefs(store);
  const { locale } = useI18n();

  const search = ref('');
  const specializationFilter = ref('');

  const filtered = computed<Doctor[]>(() => {
    const q = search.value.trim();
    const ql = q.toLowerCase();
    return items.value.filter((d) => {
      const name = locale.value === 'ar' ? d.nameAr : d.nameEn;
      const matchQ =
        !q || name.includes(q) || d.nameEn.toLowerCase().includes(ql) || d.email.includes(ql);
      const matchSp = !specializationFilter.value || d.specializationId === specializationFilter.value;
      return matchQ && matchSp;
    });
  });

  const specializationOf = (d: Doctor) =>
    specStore.items.find((s) => s.id === d.specializationId) ?? null;

  async function load(): Promise<void> {
    await Promise.all([store.fetchAll(), specStore.fetchAll()]);
  }

  return {
    items,
    filtered,
    loading,
    error,
    search,
    specializationFilter,
    specializations: computed(() => specStore.items),
    specializationOf,
    load,
    save: store.save,
    remove: store.remove,
    toggleStatus: store.toggleStatus,
  };
}
