import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { Admin, Credentials } from '@/domain/entities/Admin';
import { getSupabaseClient } from '@/infrastructure/supabase/client';

export class SupabaseAuthRepository implements IAuthRepository {
  private db = getSupabaseClient();

  async signIn(credentials: Credentials): Promise<Admin> {
    const { data, error } = await this.db.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error || !data.user) throw new Error('INVALID_CREDENTIALS');
    return this.toAdmin(data.user.id, data.user.email ?? credentials.email);
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut();
  }

  async getCurrentAdmin(): Promise<Admin | null> {
    const { data } = await this.db.auth.getUser();
    if (!data.user) return null;
    return this.toAdmin(data.user.id, data.user.email ?? '');
  }

  /**
   * Builds the admin from the auth user, enriching with the `profiles` row when
   * present. Works even if no dedicated admins table exists in the app DB.
   */
  private async toAdmin(id: string, email: string): Promise<Admin> {
    let name = '';
    try {
      const { data } = await this.db.from('profiles').select('name').eq('id', id).maybeSingle();
      name = data?.name ?? '';
    } catch {
      /* profiles row optional */
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
