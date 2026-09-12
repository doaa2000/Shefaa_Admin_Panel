import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Turning a silent or unreadable refusal into a sentence that names the cause.
 *
 * Row level security does not refuse a write it disallows -- it narrows the
 * rows the statement can see and reports a clean write of nothing -- and when
 * it does speak, it says "new row violates row-level security policy", which
 * names neither the account nor what to do about it.
 *
 * In this panel it is nearly always one of two things, and they look identical
 * from the outside: the signed-in account is not in `public.admins`, or there
 * is no signed-in account at all and the request went out anonymously. So the
 * message says which, by asking who is signed in at the moment it fails.
 */

/** Who the panel is acting as, for a message. Never throws. */
async function signedInAs(client: SupabaseClient): Promise<string | null> {
  try {
    const { data } = await client.auth.getUser();
    return data.user?.email ?? data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function refusalMessage(client: SupabaseClient): Promise<string> {
  const who = await signedInAs(client);

  if (!who) {
    return (
      'Nobody is signed in, so the change was refused. ' +
      'Sign in again and retry.'
    );
  }

  return (
    `Signed in as ${who}, which is not an administrator, ` +
    'so the change was not saved. Ask an existing administrator to add this ' +
    'account, or sign in with one that already is.'
  );
}

/** True for the shapes a refused write arrives in. */
function isRefusal(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  const code = e?.code ?? '';
  const message = e?.message ?? '';

  return (
    // PostgREST saying `.single()` got no row back, which after an update
    // means the row was there but out of reach.
    code === 'PGRST116' ||
    // Postgres refusing an insert outright, and the code raised by the
    // is_admin() guard inside admin_dashboard_stats.
    code === '42501' ||
    // Storage answers in its own words for the same refusal.
    code === 'Unauthorized' ||
    message.includes('row-level security')
  );
}

/** Throws when a delete removed nothing. Pass the rows the delete returned. */
export async function assertDeleted(
  rows: unknown[] | null,
  what: string,
  client: SupabaseClient,
): Promise<void> {
  if (rows && rows.length > 0) return;
  throw new Error(`${what} was not deleted. ${await refusalMessage(client)}`);
}

/** Rewrites a refused write; passes anything else through unchanged. */
export async function describeWriteError(
  error: unknown,
  client: SupabaseClient,
): Promise<Error> {
  if (isRefusal(error)) return new Error(await refusalMessage(client));

  const message = (error as { message?: string } | null)?.message ?? '';
  return error instanceof Error ? error : new Error(message || 'Write failed');
}
