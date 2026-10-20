/** Aggregate metrics powering the dashboard. */
export interface StatMetric {
  value: number;
  trend: number;
}

export interface CityBookings {
  en: string;
  ar: string;
  value: number;
}

export interface DashboardStats {
  /** Bookings made in the app, not cancelled. The clinic's own are counted
   *  apart: the platform did not bring those patients. */
  bookings: StatMetric;
  /** Bookings the clinics entered themselves (0061), not cancelled. */
  clinicBookings: number;
  doctors: StatMetric;
  /** Every paid payment, the clinics' own included. Not shown: it reads as
   *  what the platform earned, and it is not. */
  revenue: StatMetric;
  patients: StatMetric;
  /** All bookings by month, both kinds -- the clinic's schedule as a whole. */
  trend: {
    monthsEn: string[];
    monthsAr: string[];
    values: number[];
  };
  byCity: CityBookings[];
}
