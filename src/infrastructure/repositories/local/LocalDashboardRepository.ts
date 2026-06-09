import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { DashboardStats } from '@/domain/entities/DashboardStats';
import { SEED_DASHBOARD } from '@/infrastructure/seed/seed-data';
import { delay } from './LocalDatabase';

export class LocalDashboardRepository implements IDashboardRepository {
  getStats(): Promise<DashboardStats> {
    return delay(structuredClone(SEED_DASHBOARD));
  }
}
