import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import type { EntityId } from '@/shared/types';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useSpecializationsStore = defineStore('specializations', () => {
  const items = ref<Specialization[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.SpecializationsService);

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

  async function save(input: SpecializationInput): Promise<void> {
    const saved = await service().save(input);
    const idx = items.value.findIndex((s) => s.id === saved.id);
    if (idx >= 0) items.value[idx] = saved;
    else items.value.push(saved);
  }

  async function remove(id: EntityId): Promise<void> {
    await service().remove(id);
    items.value = items.value.filter((s) => s.id !== id);
  }

  return { items, loading, error, loaded, fetchAll, save, remove };
});
