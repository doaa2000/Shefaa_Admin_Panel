import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { DashboardStats } from '@/domain/entities/DashboardStats';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { SEED_DASHBOARD } from '@/infrastructure/seed/seed-data';

/**
 * Reads pre-aggregated metrics from the `dashboard_stats` RPC. Falls back to the
 * static structure when the RPC is unavailable so the page never breaks.
 */
export class SupabaseDashboardRepository implements IDashboardRepository {
  private db = getSupabaseClient();

  async getStats(): Promise<DashboardStats> {
    const { data, error } = await this.db.rpc('dashboard_stats');
    if (error || !data) return structuredClone(SEED_DASHBOARD);
    return data as DashboardStats;
  }
}
