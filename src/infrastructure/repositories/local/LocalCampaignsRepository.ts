import type { ICampaignsRepository } from '@/domain/repositories/ICampaignsRepository';
import type {
  AnnounceResult,
  Campaign,
  CampaignDelivery,
  CampaignInput,
} from '@/domain/entities/Campaign';
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
    return delay({ status, round: updated.round, addressed: 0, audience: null });
  }

  /**
   * A made-up breakdown, so the delivery line can be looked at without a
   * backend. Shaped like a real one -- most of the people missed have no phone
   * registered, a few phones refused -- and drawn from the demo patients, so
   * the names in the list are names the rest of the demo shows.
   *
   * Nothing for a convoy that was never announced, which is what the server
   * would say too.
   */
  async delivery(id: EntityId): Promise<CampaignDelivery | null> {
    const campaign = localDb.read('campaigns').find((c) => c.id === id);
    if (!campaign || campaign.round === 0) {
      return delay({ told: 0, delivered: 0, noDevice: 0, failed: 0, pending: 0, missed: [] });
    }
    const patients = localDb.read('patients');
    const missed = patients.slice(0, 4).map((p, i) => ({
      userId: String(p.id),
      name: p.nameAr || p.nameEn,
      phone: p.phone,
      reason: i === 3 ? ('failed' as const) : ('no_device' as const),
    }));
    const pending = 1;
    const told = Math.max(patients.length, missed.length + pending) * 4;
    return delay({
      told,
      delivered: told - missed.length - pending,
      noDevice: missed.filter((m) => m.reason === 'no_device').length,
      failed: missed.filter((m) => m.reason === 'failed').length,
      pending,
      missed,
    });
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
