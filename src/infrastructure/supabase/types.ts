/**
 * Raw row shapes for the EXISTING app database (snake_case, real table names).
 * Kept out of the domain. Joins are resolved in JS inside the repositories
 * (rather than via PostgREST embedding) so they don't depend on FK metadata.
 */

export interface SpecialtyRow {
  id: number;
  name: string;
  icon: string | null;
  name_ar: string | null;
  description: string | null;
  color: string | null;
  base_fee: number | null;
}

export interface DoctorRow {
  id: number;
  name: string;
  specialty_id: number | null;
  specialization: string | null;
  clinic_id: number | null;
  consultation_fee: number | null;
  status: string | null;
  email: string | null;
  image: string | null;
  title: string | null;
}

export interface GovernorateRow {
  id: number;
  name: string;
  country_id: number | null;
}

export interface CityRow {
  id: number;
  name: string;
  governorate_id: number | null;
}

export interface ClinicRow {
  id: number;
  name: string;
  address: string | null;
  city_id: number | null;
}

export interface ProfileRow {
  id: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  status: string | null;
}

export interface BookingRow {
  id: number;
  patient_id: string | null;
  doctor_id: number | null;
  payment_id: number | null;
  booked_date: string | null;
  start_time: string | null;
  status: string | null;
}

export interface PaymentRow {
  id: number;
  amount: number | null;
  status: string | null;
}

export interface BannerRow {
  id: number;
  image_url: string | null;
  title: string | null;
  subtitle: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}
