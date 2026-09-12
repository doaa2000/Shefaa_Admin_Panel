import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBannersStore } from '@/presentation/stores/banners.store';
import type { Banner } from '@/domain/entities/Banner';

export function useBanners() {
  const store = useBannersStore();
  const { items, loading, error } = storeToRefs(store);

  /** What the app will actually show, in the order it will show it. */
  const active = computed(() => items.value.filter((b) => b.isActive));

  /** The position a newly added banner takes: last in the carousel. */
  const nextSortOrder = computed(
    () => items.value.reduce((max, b) => Math.max(max, b.sortOrder), 0) + 1,
  );

  async function load(): Promise<void> {
    await store.fetchAll();
  }

  /** Flips one banner on or off without opening the form. */
  async function toggleActive(banner: Banner): Promise<void> {
    await store.save({
      id: banner.id,
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle,
      sortOrder: banner.sortOrder,
      isActive: !banner.isActive,
    });
  }

  /**
   * Moves a banner one place up or down, then renumbers the list 1..N and
   * saves only the rows whose number actually changed. Renumbering rather than
   * swapping is what makes this safe on rows that share a position -- every
   * banner added straight through SQL starts at sort_order 0, and swapping two
   * zeros moves nothing.
   */
  async function move(banner: Banner, direction: -1 | 1): Promise<void> {
    const list = [...items.value];
    const index = list.findIndex((b) => b.id === banner.id);
    const to = index + direction;
    if (index < 0 || to < 0 || to >= list.length) return;

    list.splice(to, 0, ...list.splice(index, 1));

    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      const sortOrder = i + 1;
      if (b.sortOrder === sortOrder) continue;
      await store.save({
        id: b.id,
        imageUrl: b.imageUrl,
        title: b.title,
        subtitle: b.subtitle,
        sortOrder,
        isActive: b.isActive,
      });
    }
  }

  return {
    items,
    active,
    loading,
    error,
    nextSortOrder,
    load,
    move,
    toggleActive,
    save: store.save,
    remove: store.remove,
    uploadImage: store.uploadImage,
  };
}
