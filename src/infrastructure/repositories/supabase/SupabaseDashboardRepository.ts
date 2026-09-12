import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { DashboardStats } from '@/domain/entities/DashboardStats';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { describeWriteError } from './writeGuards';

/**
 * The figures on the front page, counted by `admin_dashboard_stats`.
 *
 * This used to fall back to the seed figures whenever the call failed, so that
 * "the page never breaks". The call had always failed -- the function did not
 * exist -- and the front page of the panel therefore read 1,437 bookings,
 * 3,219 patients and EGP 684,500 of revenue, none of which had ever happened,
 * with nothing on screen to say so.
 *
 * A page that breaks is obviously broken. A page of confident numbers that are
 * fiction is believed, and decisions get made on it. So it throws now, and the
 * page shows the error.
 */
export class SupabaseDashboardRepository implements IDashboardRepository {
  private db = getSupabaseClient();

  async getStats(): Promise<DashboardStats> {
    const { data, error } = await this.db.rpc('admin_dashboard_stats');
    if (error) throw await describeWriteError(error, this.db);
    if (!data) throw new Error('The dashboard figures came back empty.');
    return data as DashboardStats;
  }
}
