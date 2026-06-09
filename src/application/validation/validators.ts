/**
 * Reusable, framework-agnostic validation rules. Validation logic lives here in
 * the application layer (never inside components) so it can be tested and reused.
 */
export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

export interface DoctorFormValues {
  nameEn: string;
  specializationId: string;
  clinicId: string;
  fee: string | number;
}

export function validateDoctorForm(
  v: DoctorFormValues,
  requiredMsg: string,
): ValidationErrors<'nameEn' | 'specializationId' | 'clinicId' | 'fee'> {
  const e: ValidationErrors<'nameEn' | 'specializationId' | 'clinicId' | 'fee'> = {};
  if (!v.nameEn.trim()) e.nameEn = requiredMsg;
  if (!v.specializationId) e.specializationId = requiredMsg;
  if (!v.clinicId) e.clinicId = requiredMsg;
  if (!v.fee) e.fee = requiredMsg;
  return e;
}

export interface SpecializationFormValues {
  nameEn: string;
  baseFee: string | number;
}

export function validateSpecializationForm(
  v: SpecializationFormValues,
  requiredMsg: string,
): ValidationErrors<'nameEn' | 'baseFee'> {
  const e: ValidationErrors<'nameEn' | 'baseFee'> = {};
  if (!v.nameEn.trim()) e.nameEn = requiredMsg;
  if (!v.baseFee) e.baseFee = requiredMsg;
  return e;
}

export function validateRequired(value: string, requiredMsg: string): string | undefined {
  return value.trim() ? undefined : requiredMsg;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
