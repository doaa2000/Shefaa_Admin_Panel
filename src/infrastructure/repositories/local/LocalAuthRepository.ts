import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { Admin, Credentials } from '@/domain/entities/Admin';
import { delay } from './LocalDatabase';

const SESSION_KEY = 'shefaa.admin.session';

const DEMO_ADMIN: Admin = {
  id: 'admin-1',
  nameEn: 'Dr. Layla Hassan',
  nameAr: 'د. ليلى حسن',
  email: 'admin@shefaa.eg',
  role: 'System Administrator',
};

/**
 * Local auth: accepts the demo credentials and persists a lightweight session.
 * Demo login → admin@shefaa.eg / shefaa123
 */
export class LocalAuthRepository implements IAuthRepository {
  async signIn(credentials: Credentials): Promise<Admin> {
    const ok =
      credentials.email.trim().toLowerCase() === DEMO_ADMIN.email &&
      credentials.password === 'shefaa123';
    if (!ok) {
      await delay(null);
      throw new Error('INVALID_CREDENTIALS');
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_ADMIN));
    return delay(DEMO_ADMIN);
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    await delay(null);
  }

  async getCurrentAdmin(): Promise<Admin | null> {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Admin) : null;
    } catch {
      return null;
    }
  }
}
