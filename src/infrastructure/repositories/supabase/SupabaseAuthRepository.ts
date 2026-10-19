import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { Admin, Credentials } from '@/domain/entities/Admin';
import { getSupabaseClient } from '@/infrastructure/supabase/client';

/**
 * Signing in to the panel is signing in to Supabase *and* being in
 * `public.admins`.
 *
 * Supabase will hand a session to any account with the right password -- a
 * patient's, a doctor's -- and the panel used to take that as a way in. Row
 * level security still refused every write, but the account could open every
 * page and read what its own policies let it read, which for a doctor is a
 * good deal. So the question the database itself asks, `public.is_admin()`,
 * is asked here too, straight after the password is accepted and again when a
 * stored session is picked up on boot. An account that is not an
 * administrator is signed out on the spot.
 */
export class SupabaseAuthRepository implements IAuthRepository {
  private db = getSupabaseClient();

  async signIn(credentials: Credentials): Promise<Admin> {
    const { data, error } = await this.db.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) {
      // A wrong password and an unreachable server are different problems
      // with different fixes; only the first is the user's to correct.
      throw new Error(error.name === 'AuthRetryableFetchError' ? 'AUTH_UNREACHABLE' : 'INVALID_CREDENTIALS');
    }
    if (!data.user) throw new Error('INVALID_CREDENTIALS');

    await this.requireAdmin();
    return this.toAdmin(data.user.id, data.user.email ?? credentials.email);
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut();
  }

  async getCurrentAdmin(): Promise<Admin | null> {
    const { data } = await this.db.auth.getUser();
    if (!data.user) return null;

    // A session stored before this check existed, or one left by an account
    // that has since been removed from `admins`, must not open the panel.
    // When the check cannot be made at all the answer is still no: the login
    // page is the place to find out why.
    try {
      await this.requireAdmin();
    } catch {
      return null;
    }
    return this.toAdmin(data.user.id, data.user.email ?? '');
  }

  /**
   * Throws NOT_ADMIN (after signing out) when the signed-in account is not an
   * administrator, and ADMIN_CHECK_FAILED when the database could not be
   * asked. The session is dropped in both cases, so nothing half-signed-in is
   * left behind; the local scope does that without needing the network.
   */
  private async requireAdmin(): Promise<void> {
    const { data, error } = await this.db.rpc('is_admin');
    if (error || data !== true) {
      await this.db.auth.signOut({ scope: 'local' });
      throw new Error(error ? 'ADMIN_CHECK_FAILED' : 'NOT_ADMIN');
    }
  }

  /**
   * Builds the admin from the auth user, with the name from the `admins` row
   * (readable by its own account) or, failing that, the `profiles` row.
   */
  private async toAdmin(id: string, email: string): Promise<Admin> {
    let name = '';
    try {
      const { data } = await this.db.from('admins').select('name').eq('id', id).maybeSingle();
      name = data?.name ?? '';
      if (!name) {
        const { data: profile } = await this.db.from('profiles').select('name').eq('id', id).maybeSingle();
        name = profile?.name ?? '';
      }
    } catch {
      /* the name is decoration; an admin without one is still an admin */
    }
    return {
      id,
      email,
      nameEn: name || 'Administrator',
      nameAr: name || 'مدير',
      role: 'System Administrator',
    };
  }
}
