/** Shared status → badge-variant map (used where a class string is needed). */
export const STATUS_VARIANT: Record<string, string> = {
  active: 'ok',
  inactive: 'neutral',
  blocked: 'danger',
  completed: 'ok',
  confirmed: 'info',
  pending: 'warn',
  cancelled: 'danger',
};
