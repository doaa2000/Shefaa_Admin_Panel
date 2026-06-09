import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useDoctorsStore = defineStore('doctors', () => {
  const items = ref<Doctor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.DoctorsService);

  async function fetchAll(force = false): Promise<void> {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      items.value = await service().getAll();
      loaded.value = true;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function save(input: DoctorInput): Promise<void> {
    const saved = await service().save(input);
    const idx = items.value.findIndex((d) => d.id === saved.id);
    if (idx >= 0) items.value[idx] = saved;
    else items.value.unshift(saved);
  }

  async function remove(id: EntityId): Promise<void> {
    await service().remove(id);
    items.value = items.value.filter((d) => d.id !== id);
  }

  async function toggleStatus(doctor: Doctor): Promise<void> {
    const updated = await service().toggleStatus(doctor);
    const idx = items.value.findIndex((d) => d.id === updated.id);
    if (idx >= 0) items.value[idx] = updated;
  }

  return { items, loading, error, loaded, fetchAll, save, remove, toggleStatus };
});
