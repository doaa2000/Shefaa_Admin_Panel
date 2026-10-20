import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ClinicInput, Governorate, LocationChain } from '@/domain/entities/Location';
import type { EntityId } from '@/shared/types';
import type { LocationLevel } from '@/domain/enums';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useLocationsStore = defineStore('locations', () => {
  const tree = ref<Governorate[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const service = () => container.resolve(TOKENS.LocationsService);

  async function fetchTree(force = false): Promise<void> {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      tree.value = await service().getTree();
      loaded.value = true;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function addNode(
    level: LocationLevel,
    nameEn: string,
    nameAr: string,
    parent: LocationChain,
  ): Promise<void> {
    tree.value = await service().addNode(level, nameEn, nameAr, parent);
  }

  async function deleteNode(level: LocationLevel, ids: LocationChain): Promise<void> {
    tree.value = await service().deleteNode(level, ids);
  }

  /** Saves the clinic and returns its id, which a new one only now has. */
  async function saveClinic(input: ClinicInput): Promise<EntityId> {
    const saved = await service().saveClinic(input);
    tree.value = saved.tree;
    return saved.clinicId;
  }

  return { tree, loading, error, loaded, fetchTree, addNode, deleteNode, saveClinic };
});
