/** Domain enumerations — independent of any backend representation. */

export enum DoctorStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum PatientStatus {
  Active = 'active',
  Blocked = 'blocked',
}

export enum AppointmentStatus {
  Completed = 'completed',
  Confirmed = 'confirmed',
  Pending = 'pending',
  Cancelled = 'cancelled',
}

export enum LocationLevel {
  Governorate = 'gov',
  City = 'city',
  Clinic = 'clinic',
}
