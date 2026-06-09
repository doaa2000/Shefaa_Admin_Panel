import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DashboardData } from '@/application/services/DashboardService';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const service = () => container.resolve(TOKENS.DashboardService);

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      data.value = await service().load();
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
});
