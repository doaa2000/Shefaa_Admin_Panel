import type { ICampaignsRepository } from '@/domain/repositories/ICampaignsRepository';
import type { AnnounceResult, Campaign, CampaignInput } from '@/domain/entities/Campaign';
import type { EntityId } from '@/shared/types';
import { localDb, delay } from './LocalDatabase';

export class LocalCampaignsRepository implements ICampaignsRepository {
  list(): Promise<Campaign[]> {
    const items = [...localDb.read('campaigns')].sort((a, b) =>
      b.startsOn.localeCompare(a.startsOn),
    );
    return delay(items);
  }

  async save(input: CampaignInput): Promise<Campaign> {
    const list = localDb.read('campaigns');
    const previous = list.find((c) => c.id === input.id);
    const campaign: Campaign = {
      ...input,
      id: input.id ?? 'cp' + Date.now(),
      // Carried over rather than reset: editing a convoy does not unsend the
      // announcement that already went out.
      round: previous?.round ?? 0,
      announcedAt: previous?.announcedAt ?? null,
    };
    const next = previous
      ? list.map((c) => (c.id === campaign.id ? campaign : c))
      : [...list, campaign];
    localDb.write('campaigns', next);
    return delay(campaign);
  }

  async delete(id: EntityId): Promise<void> {
    localDb.write('campaigns', localDb.read('campaigns').filter((c) => c.id !== id));
    await delay(null);
  }

  /**
   * Nothing is sent without a backend, and saying so is the point: this
   * provider exists to let the panel be clicked through without a database,
   * and a demo that reports pushes nobody received would teach the wrong
   * thing about which button sends.
   */
  async announce(id: EntityId): Promise<AnnounceResult> {
    const list = localDb.read('campaigns');
    const campaign = list.find((c) => c.id === id);
    if (!campaign) throw new Error('The convoy is no longer there.');
    const status = campaign.status === 'draft' ? 'announced' : campaign.status;
    const updated: Campaign = {
      ...campaign,
      status,
      round: campaign.round + 1,
      announcedAt: new Date().toISOString(),
    };
    localDb.write('campaigns', list.map((c) => (c.id === id ? updated : c)));
    return delay({ status, round: updated.round, addressed: 0 });
  }

  /** No storage without a backend, so the picture is kept inline in the row. */
  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
  }
}
