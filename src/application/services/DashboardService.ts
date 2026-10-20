import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import type { DashboardStats, StatMetric } from '@/domain/entities/DashboardStats';
import type { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus, DoctorStatus } from '@/domain/enums';
import { monthBounds, monthOverMonth } from '@/shared/utils/months';

/** Before the platform took any share; the statement starts from here. */
const BEGINNING = '2000-01-01';

export interface DashboardData {
  stats: DashboardStats;
  appointments: Appointment[];
  activeDoctors: number;
  /**
   * The platform's share earned so far, or null when it could not be read.
   * Null is shown as a dash, never as a zero: the demo backend has no money in
   * it on purpose, and "EGP 0 due" is a claim.
   */
  commission: StatMetric | null;
}

export class DashboardService {
  constructor(
    private readonly dashboardRepo: IDashboardRepository,
    private readonly appointmentsRepo: IAppointmentsRepository,
    private readonly doctorsRepo: IDoctorsRepository,
    private readonly commissionRepo: ICommissionRepository,
  ) {}

  /** Loads everything the dashboard renders in a single call. */
  async load(): Promise<DashboardData> {
    const [stats, appointments, doctors, commission] = await Promise.all([
      this.dashboardRepo.getStats(),
      this.appointmentsRepo.list(),
      this.doctorsRepo.list(),
      this.commissionDue(),
    ]);
    return {
      stats,
      appointments,
      activeDoctors: doctors.filter((d) => d.status === DoctorStatus.Active).length,
      commission,
    };
  }

  /**
   * What the platform has earned, in place of "revenue".
   *
   * The revenue figure summed every paid payment, and since 0061 that
   * includes the fees of patients a clinic booked over the telephone -- money
   * the platform had no part in, which made it look as though it had taken
   * more than it had. The commission is the platform's own figure: the rate
   * written on each app booking when it was made, and nothing on the
   * clinic's, which carry no rate.
   *
   * Read from the same statement the commission page shows, so the two pages
   * cannot disagree. Up to today, because a booking next week has earned
   * nothing yet; the trend compares this month with the last by booked date,
   * as the bookings card does.
   */
  private async commissionDue(): Promise<StatMetric | null> {
    const { today, monthStart, monthEnd, prevStart, prevEnd } = monthBounds(new Date());
    try {
      const [all, current, previous] = await Promise.all([
        this.commissionRepo.getStatement(BEGINNING, today),
        this.commissionRepo.getStatement(monthStart, monthEnd),
        this.commissionRepo.getStatement(prevStart, prevEnd),
      ]);
      return {
        value: Number(all.totals.commission) || 0,
        trend: monthOverMonth(
          Number(current.totals.commission) || 0,
          Number(previous.totals.commission) || 0,
        ),
      };
    } catch {
      // The rest of the page is still true without it.
      return null;
    }
  }

  recentBookings(appts: Appointment[], limit = 6): Appointment[] {
    return [...appts]
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .slice(0, limit);
  }

  todayActivity(appts: Appointment[], limit = 5): Appointment[] {
    return appts.slice(0, limit);
  }

  statusCounts(appts: Appointment[]): Record<AppointmentStatus, number> {
    return appts.reduce(
      (m, a) => {
        m[a.status] = (m[a.status] ?? 0) + 1;
        return m;
      },
      {} as Record<AppointmentStatus, number>,
    );
  }
}
