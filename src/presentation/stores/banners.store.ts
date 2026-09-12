import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Banner, BannerInput } from '@/domain/entities/Banner';
import type { EntityId } from '@/shared/types';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useBannersStore = defineStore('banners', () => {
  const items = ref<Banner[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.BannersService);

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

  async function save(input: BannerInput): Promise<void> {
    const saved = await service().save(input);
    const idx = items.value.findIndex((b) => b.id === saved.id);
    if (idx >= 0) items.value[idx] = saved;
    else items.value.push(saved);
    sort();
  }

  async function remove(id: EntityId): Promise<void> {
    await service().remove(id);
    items.value = items.value.filter((b) => b.id !== id);
  }

  function uploadImage(file: File): Promise<string> {
    return service().uploadImage(file);
  }

  /** Keeps the list in the order the app will show it after every change. */
  function sort(): void {
    items.value = [...items.value].sort(
      (a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id),
    );
  }

  return { items, loading, error, loaded, fetchAll, save, remove, uploadImage };
});
