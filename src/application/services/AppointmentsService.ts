import type { IAppointmentsRepository } from '@/domain/repositories/IAppointmentsRepository';
import type { Appointment } from '@/domain/entities/Appointment';
import type { AppointmentStatus } from '@/domain/enums';

export interface AppointmentFilters {
  search: string;
  city: string;
  doctor: string;
  status: string;
}

export class AppointmentsService {
  constructor(private readonly repo: IAppointmentsRepository) {}

  getAll(): Promise<Appointment[]> {
    return this.repo.list();
  }

  /** Distinct city values (by English key) present in the dataset. */
  distinctCities(appts: Appointment[]): string[] {
    return [...new Set(appts.map((a) => a.cityEn))];
  }

  distinctDoctors(appts: Appointment[]): string[] {
    return [...new Set(appts.map((a) => a.doctorEn))];
  }

  /** Applies the appointments page filters and sorts most-recent-first. */
  applyFilters(appts: Appointment[], f: AppointmentFilters): Appointment[] {
    const q = f.search.trim().toLowerCase();
    return appts
      .filter((a) => {
        const matchQ =
          !q ||
          a.patientAr.includes(f.search) ||
          a.patientEn.toLowerCase().includes(q) ||
          a.doctorEn.toLowerCase().includes(q);
        return (
          matchQ &&
          (!f.city || a.cityEn === f.city) &&
          (!f.doctor || a.doctorEn === f.doctor) &&
          (!f.status || a.status === f.status)
        );
      })
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  countByStatus(appts: Appointment[]): Record<AppointmentStatus, number> {
    return appts.reduce(
      (m, a) => {
        m[a.status] = (m[a.status] ?? 0) + 1;
        return m;
      },
      {} as Record<AppointmentStatus, number>,
    );
  }

  /** Builds a CSV export of the supplied appointments. */
  toCsv(appts: Appointment[]): string {
    const header = ['Patient', 'Doctor', 'Specialization', 'City', 'DateTime', 'Price', 'Status'];
    const rows = appts.map((a) => [
      a.patientEn,
      a.doctorEn,
      a.specializationEn,
      a.cityEn,
      a.datetime,
      String(a.price),
      a.status,
    ]);
    return [header, ...rows]
      .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}
