import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Patient } from '@/domain/entities/Patient';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const usePatientsStore = defineStore('patients', () => {
  const items = ref<Patient[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.PatientsService);

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

  async function toggleBlocked(patient: Patient): Promise<void> {
    const updated = await service().toggleBlocked(patient);
    const idx = items.value.findIndex((p) => p.id === updated.id);
    if (idx >= 0) items.value[idx] = updated;
  }

  return { items, loading, error, loaded, fetchAll, toggleBlocked };
});
