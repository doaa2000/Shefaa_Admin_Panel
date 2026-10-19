import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { DashboardStats, StatMetric } from '@/domain/entities/DashboardStats';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { describeWriteError } from './writeGuards';
import { isMissingColumn } from './schemaGaps';
import { monthBounds, monthOverMonth } from '@/shared/utils/months';

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
    const [rpc, split] = await Promise.all([
      this.db.rpc('admin_dashboard_stats'),
      this.bookingsByOrigin(),
    ]);
    if (rpc.error) throw await describeWriteError(rpc.error, this.db);
    if (!rpc.data) throw new Error('The dashboard figures came back empty.');
    const stats = rpc.data as Omit<DashboardStats, 'clinicBookings'>;
    return {
      ...stats,
      // Before 0061 there was no other kind of booking, so the function's own
      // count is already the app's.
      bookings: split?.app ?? stats.bookings,
      clinicBookings: split?.clinic ?? 0,
    };
  }

  /**
   * The bookings card, split by where each booking came from.
   *
   * admin_dashboard_stats counts every booking, and since 0061 that includes
   * the ones a clinic entered for its own telephone patients -- which made the
   * platform look as though it had brought more patients than it had. Counted
   * here rather than in the function so the panel does not wait on a
   * migration; the rules are the function's own: not cancelled, by booked
   * date, this month against the last.
   *
   * Null on a database without `origin`.
   */
  private async bookingsByOrigin(): Promise<{ app: StatMetric; clinic: number } | null> {
    const { monthStart, prevStart } = monthBounds(new Date());
    const count = (origin: 'app' | 'clinic', from?: string, before?: string) => {
      let q = this.db
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'cancelled')
        .eq('origin', origin);
      if (from) q = q.gte('booked_date', from);
      if (before) q = q.lt('booked_date', before);
      return q;
    };
    const results = await Promise.all([
      count('app'),
      count('app', monthStart),
      count('app', prevStart, monthStart),
      count('clinic'),
    ]);
    const failed = results.find((r) => r.error)?.error;
    if (failed && isMissingColumn(failed)) return null;
    if (failed) throw await describeWriteError(failed, this.db);
    const [all, current, previous, clinic] = results.map((r) => r.count ?? 0);
    return {
      app: { value: all, trend: monthOverMonth(current, previous) },
      clinic,
    };
  }
}
