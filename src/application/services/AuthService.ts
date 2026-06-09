import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { Admin, Credentials } from '@/domain/entities/Admin';

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  signIn(credentials: Credentials): Promise<Admin> {
    return this.repo.signIn(credentials);
  }

  signOut(): Promise<void> {
    return this.repo.signOut();
  }

  restore(): Promise<Admin | null> {
    return this.repo.getCurrentAdmin();
  }
}
