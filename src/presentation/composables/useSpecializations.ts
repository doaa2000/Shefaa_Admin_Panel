import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSpecializationsStore } from '@/presentation/stores/specializations.store';
import { useDoctorsStore } from '@/presentation/stores/doctors.store';
import { useI18n } from './useI18n';
import type { EntityId } from '@/shared/types';

export function useSpecializations() {
  const store = useSpecializationsStore();
  const doctorsStore = useDoctorsStore();
  const { items, loading, error } = storeToRefs(store);
  const { locale } = useI18n();

  const search = ref('');

  const filtered = computed(() => {
    const q = search.value.trim();
    return items.value.filter((s) => {
      const name = locale.value === 'ar' ? s.nameAr : s.nameEn;
      return !q || name.includes(q) || s.nameEn.toLowerCase().includes(q.toLowerCase());
    });
  });

  const doctorCount = (id: EntityId): number =>
    doctorsStore.items.filter((d) => d.specializationId === id).length;

  async function load(): Promise<void> {
    await Promise.all([store.fetchAll(), doctorsStore.fetchAll()]);
  }

  return {
    items,
    filtered,
    loading,
    error,
    search,
    doctorCount,
    load,
    save: store.save,
    remove: store.remove,
  };
}
