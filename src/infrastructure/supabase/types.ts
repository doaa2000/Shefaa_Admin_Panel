/** Raw row shapes returned by Supabase (snake_case), kept out of the domain. */

export interface SpecializationRow {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en: string | null;
  desc_ar: string | null;
  icon: string | null;
  color: string | null;
  base_fee: number;
}

export interface ClinicRow {
  id: string;
  name_en: string;
  name_ar: string;
  city: {
    id: string;
    name_en: string;
    name_ar: string;
    governorate: { id: string; name_en: string; name_ar: string } | null;
  } | null;
}

export interface DoctorRow {
  id: string;
  name_en: string;
  name_ar: string;
  email: string;
  fee: number;
  status: string;
  color: string | null;
  specialization_id: string;
  clinic_id: string;
  specialization: { name_en: string; name_ar: string } | null;
  clinic: ClinicRow | null;
}

export interface PatientRow {
  id: string;
  name_en: string;
  name_ar: string;
  email: string;
  phone: string;
  total_bookings: number;
  status: string;
  joined: string;
  last_visit: string | null;
  color: string | null;
}

export interface GovernorateRow {
  id: string;
  name_en: string;
  name_ar: string;
  cities: CityRow[];
}

export interface CityRow {
  id: string;
  name_en: string;
  name_ar: string;
  clinics: { id: string; name_en: string; name_ar: string }[];
}

export interface AppointmentRow {
  id: string;
  datetime: string;
  price: number;
  status: string;
  patient: { name_en: string; name_ar: string; color: string | null } | null;
  doctor: {
    name_en: string;
    name_ar: string;
    color: string | null;
    specialization: { name_en: string; name_ar: string } | null;
    clinic: ClinicRow | null;
  } | null;
}
