import type { ICampaignsRepository } from '@/domain/repositories/ICampaignsRepository';
import type { AnnounceResult, Campaign, CampaignInput } from '@/domain/entities/Campaign';
import type { EntityId } from '@/shared/types';

export class CampaignsService {
  constructor(private readonly repo: ICampaignsRepository) {}

  getAll(): Promise<Campaign[]> {
    return this.repo.list();
  }

  save(input: CampaignInput): Promise<Campaign> {
    return this.repo.save(input);
  }

  remove(id: EntityId): Promise<void> {
    return this.repo.delete(id);
  }

  announce(id: EntityId): Promise<AnnounceResult> {
    return this.repo.announce(id);
  }

  uploadImage(file: File): Promise<string> {
    return this.repo.uploadImage(file);
  }
}
