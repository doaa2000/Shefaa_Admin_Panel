import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Appointment } from '@/domain/entities/Appointment';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useAppointmentsStore = defineStore('appointments', () => {
  const items = ref<Appointment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.AppointmentsService);

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

  return { items, loading, error, loaded, fetchAll };
});
