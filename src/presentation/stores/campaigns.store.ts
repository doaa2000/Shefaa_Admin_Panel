import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AnnounceResult, Campaign, CampaignInput } from '@/domain/entities/Campaign';
import type { EntityId } from '@/shared/types';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useCampaignsStore = defineStore('campaigns', () => {
  const items = ref<Campaign[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);
  /** The convoy currently being announced, so one row shows a spinner rather
   *  than the whole page going busy. */
  const announcing = ref<EntityId | null>(null);

  const service = () => container.resolve(TOKENS.CampaignsService);

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

  async function save(input: CampaignInput): Promise<void> {
    const saved = await service().save(input);
    const idx = items.value.findIndex((c) => c.id === saved.id);
    if (idx >= 0) items.value[idx] = saved;
    else items.value.unshift(saved);
    sort();
  }

  async function remove(id: EntityId): Promise<void> {
    await service().remove(id);
    items.value = items.value.filter((c) => c.id !== id);
  }

  /**
   * Sends it, and folds what came back into the row.
   *
   * The status and the round both change on the server -- announcing a draft
   * makes it announced -- so the row is patched from the answer rather than
   * guessed at, and a reload is not needed to see the truth.
   */
  async function announce(id: EntityId): Promise<AnnounceResult> {
    announcing.value = id;
    try {
      const result = await service().announce(id);
      const idx = items.value.findIndex((c) => c.id === id);
      if (idx >= 0) {
        items.value[idx] = {
          ...items.value[idx],
          status: result.status,
          round: result.round,
          announcedAt:
            result.addressed > 0
              ? new Date().toISOString()
              : items.value[idx].announcedAt,
        };
      }
      return result;
    } finally {
      announcing.value = null;
    }
  }

  function uploadImage(file: File): Promise<string> {
    return service().uploadImage(file);
  }

  /** Newest first, which is the order the admin works in. */
  function sort(): void {
    items.value = [...items.value].sort(
      (a, b) => b.startsOn.localeCompare(a.startsOn) || Number(b.id) - Number(a.id),
    );
  }

  return {
    items,
    loading,
    error,
    loaded,
    announcing,
    fetchAll,
    save,
    remove,
    announce,
    uploadImage,
  };
});
