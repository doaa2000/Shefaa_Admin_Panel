import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { IDoctorsRepository } from '@/domain/repositories/IDoctorsRepository';
import type { DashboardStats } from '@/domain/entities/DashboardStats';
import type { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus, DoctorStatus } from '@/domain/enums';

export interface DashboardData {
  stats: DashboardStats;
  appointments: Appointment[];
  activeDoctors: number;
}

export class DashboardService {
  constructor(
    private readonly dashboardRepo: IDashboardRepository,
    private readonly appointmentsRepo: IAppointmentsRepository,
    private readonly doctorsRepo: IDoctorsRepository,
  ) {}

  /** Loads everything the dashboard renders in a single call. */
  async load(): Promise<DashboardData> {
    const [stats, appointments, doctors] = await Promise.all([
      this.dashboardRepo.getStats(),
      this.appointmentsRepo.list(),
      this.doctorsRepo.list(),
    ]);
    return {
      stats,
      appointments,
      activeDoctors: doctors.filter((d) => d.status === DoctorStatus.Active).length,
    };
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
