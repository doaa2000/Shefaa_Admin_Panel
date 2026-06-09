import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocationsStore } from '@/presentation/stores/locations.store';
import { useDoctorsStore } from '@/presentation/stores/doctors.store';
import type { EntityId } from '@/shared/types';

export function useLocations() {
  const store = useLocationsStore();
  const doctorsStore = useDoctorsStore();
  const { tree, loading, error } = storeToRefs(store);

  // Expanded node ids (governorate / city).
  const open = ref<Set<EntityId>>(new Set(['g1', 'c1']));

  const isOpen = (id: EntityId) => open.value.has(id);
  function toggle(id: EntityId): void {
    const next = new Set(open.value);
    next.has(id) ? next.delete(id) : next.add(id);
    open.value = next;
  }
  function expandAll(): void {
    const all = new Set<EntityId>();
    tree.value.forEach((g) => {
      all.add(g.id);
      g.cities.forEach((c) => all.add(c.id));
    });
    open.value = all;
  }
  function collapseAll(): void {
    open.value = new Set();
  }
  function ensureOpen(...ids: EntityId[]): void {
    const next = new Set(open.value);
    ids.forEach((id) => next.add(id));
    open.value = next;
  }

  const doctorsInClinic = (clinicId: EntityId) =>
    doctorsStore.items.filter((d) => d.clinicId === clinicId);

  const govStats = (govId: EntityId) => {
    const g = tree.value.find((x) => x.id === govId);
    if (!g) return { cities: 0, clinics: 0 };
    return {
      cities: g.cities.length,
      clinics: g.cities.reduce((sum, c) => sum + c.clinics.length, 0),
    };
  };

  async function load(): Promise<void> {
    await Promise.all([store.fetchTree(), doctorsStore.fetchAll()]);
  }

  return {
    tree,
    loading,
    error,
    open: computed(() => open.value),
    isOpen,
    toggle,
    expandAll,
    collapseAll,
    ensureOpen,
    doctorsInClinic,
    govStats,
    load,
    addNode: store.addNode,
    deleteNode: store.deleteNode,
  };
}
