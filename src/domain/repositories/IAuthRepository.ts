import type { Admin, Credentials } from '@/domain/entities/Admin';

export interface IAuthRepository {
  signIn(credentials: Credentials): Promise<Admin>;
  signOut(): Promise<void>;
  getCurrentAdmin(): Promise<Admin | null>;
}
