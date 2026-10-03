import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampaignsStore } from '@/presentation/stores/campaigns.store';
import { useLocationsStore } from '@/presentation/stores/locations.store';
import type { Campaign } from '@/domain/entities/Campaign';

/** YYYY-MM-DD in the clinic's own day. toISOString hands back UTC, which after
 *  ten at night in Cairo is already tomorrow. */
function today(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function useCampaigns() {
  const store = useCampaignsStore();
  const locations = useLocationsStore();
  const { items, loading, error, announcing } = storeToRefs(store);

  /** What the app is showing right now: announced or moved, and not finished. */
  const live = computed(() =>
    items.value.filter(
      (c) =>
        (c.status === 'announced' || c.status === 'postponed') && c.endsOn >= today(),
    ),
  );

  /** Written but never sent. The list the admin is most likely to have
   *  forgotten about, so it is counted separately. */
  const drafts = computed(() => items.value.filter((c) => c.status === 'draft'));

  const governorateOptions = computed(() =>
    locations.tree.map((g) => ({ value: g.id, label: g.nameAr || g.nameEn })),
  );

  /** Only the cities of the chosen governorate. The database refuses a city
   *  from anywhere else, and offering one is offering a mistake. */
  function cityOptions(governorateId: string) {
    const governorate = locations.tree.find((g) => String(g.id) === String(governorateId));
    return (governorate?.cities ?? []).map((c) => ({
      value: c.id,
      label: c.nameAr || c.nameEn,
    }));
  }

  async function load(): Promise<void> {
    // Both, because the form cannot offer a governorate it has not read.
    await Promise.all([store.fetchAll(), locations.fetchTree()]);
  }

  /**
   * Whether announcing this convoy could do anything.
   *
   * A draft, an announcement, a postponement and a cancellation are all
   * announceable -- the last two are the whole reason announcing is repeatable
   * -- but a convoy whose last day has passed is not, and the server refuses
   * it. Said here as well so the button is disabled rather than failing.
   */
  function canAnnounce(campaign: Campaign): boolean {
    return campaign.endsOn >= today();
  }

  function placeOf(campaign: Campaign): string {
    const governorate = locations.tree.find(
      (g) => String(g.id) === String(campaign.governorateId),
    );
    const city = governorate?.cities.find((c) => String(c.id) === String(campaign.cityId));
    return [campaign.venue, city?.nameAr || city?.nameEn, governorate?.nameAr || governorate?.nameEn]
      .filter((p) => (p ?? '').trim() !== '')
      .join(' - ');
  }

  return {
    items,
    live,
    drafts,
    loading,
    error,
    announcing,
    governorateOptions,
    cityOptions,
    canAnnounce,
    placeOf,
    today,
    load,
    save: store.save,
    remove: store.remove,
    announce: store.announce,
    uploadImage: store.uploadImage,
  };
}
