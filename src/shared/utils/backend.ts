/**
 * Which backend the panel is talking to.
 *
 * The provider is chosen in registerServices, but the answer is needed in the
 * UI as well: without an `.env` file the panel silently falls back to `local`,
 * where every change is written to this browser's storage and reaches nothing
 * else. That is indistinguishable from a working panel until somebody notices
 * that the app is showing different data -- which is exactly how it was found.
 */
export type BackendProvider = 'local' | 'supabase';

export function backendProvider(): BackendProvider {
  return import.meta.env.VITE_BACKEND_PROVIDER === 'supabase'
    ? 'supabase'
    : 'local';
}

export function isLocalBackend(): boolean {
  return backendProvider() === 'local';
}
