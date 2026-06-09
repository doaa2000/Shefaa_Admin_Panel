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
  bookings: StatMetric;
  doctors: StatMetric;
  revenue: StatMetric;
  patients: StatMetric;
  trend: {
    monthsEn: string[];
    monthsAr: string[];
    values: number[];
  };
  byCity: CityBookings[];
}
