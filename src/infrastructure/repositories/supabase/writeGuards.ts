/**
 * Turning a silent refusal into a message.
 *
 * Row level security does not refuse a write it disallows -- it narrows the
 * rows the statement can see and reports a clean write of nothing. The admin
 * panel then removed the row from the screen, and it came back on the next
 * reload with nothing anywhere to say why. The commonest cause is the simplest
 * one: the signed-in account is not in `public.admins`.
 */

const NOT_AN_ADMIN =
  'This account is not an administrator, so the change was not saved. ' +
  'Ask an existing administrator to add your account.';

/** Throws when a delete removed nothing. Pass the rows the delete returned. */
export function assertDeleted(rows: unknown[] | null, what: string): void {
  if (rows && rows.length > 0) return;
  throw new Error(`${what} was not deleted. ${NOT_AN_ADMIN}`);
}

/**
 * Rewrites the two shapes a refused write arrives in.
 *
 * PGRST116 is PostgREST saying `.single()` got no row back, which after an
 * update means the row was there but out of reach. 42501 is Postgres refusing
 * an insert outright.
 */
export function describeWriteError(error: unknown): Error {
  const e = error as { code?: string; message?: string } | null;
  const code = e?.code ?? '';
  const message = e?.message ?? '';

  if (
    code === 'PGRST116' ||
    code === '42501' ||
    // Storage answers in its own words for the same refusal.
    code === 'Unauthorized' ||
    message.includes('row-level security') ||
    message.includes('violates row-level security policy')
  ) {
    return new Error(NOT_AN_ADMIN);
  }

  return error instanceof Error ? error : new Error(message || 'Write failed');
}
