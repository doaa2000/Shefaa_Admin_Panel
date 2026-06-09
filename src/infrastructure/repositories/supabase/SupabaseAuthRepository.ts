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

  /** Loads the admin profile row joined to the auth user. */
  private async toAdmin(id: string, email: string): Promise<Admin> {
    const { data } = await this.db
      .from('admins')
      .select('name_en, name_ar, role')
      .eq('id', id)
      .maybeSingle();
    return {
      id,
      email,
      nameEn: data?.name_en ?? 'Administrator',
      nameAr: data?.name_ar ?? 'مدير',
      role: data?.role ?? 'System Administrator',
    };
  }
}
