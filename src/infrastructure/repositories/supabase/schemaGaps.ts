/**
 * Telling "this database is older than the panel" from a real failure.
 *
 * The panel is deployed separately from the migrations, and for a while after
 * a release it talks to a database that has not been migrated yet. A feature
 * that needs the newer schema should then step aside, not take the page down
 * with an error about a function nobody on the page asked for.
 */

interface PgError {
  code?: string;
  message?: string;
}

/** PostgREST could not find the function: it was never created here. */
export function isMissingFunction(error: unknown): boolean {
  const e = error as PgError | null;
  // PGRST202 is PostgREST's own "no such function in the schema cache";
  // 42883 is Postgres saying the same when the call gets that far.
  return e?.code === 'PGRST202' || e?.code === '42883';
}

/** A column the query names does not exist on this database. */
export function isMissingColumn(error: unknown): boolean {
  const e = error as PgError | null;
  // 42703 from Postgres; PostgREST reports an unknown column in a select or a
  // filter as PGRST204 or with Postgres's code, depending on where it notices.
  return e?.code === '42703' || e?.code === 'PGRST204';
}
