import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Review } from '@/domain/entities/Review';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useReviewsStore = defineStore('reviews', () => {
  const items = ref<Review[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.ReviewsService);

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
