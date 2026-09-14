import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import type { CommissionStatement } from '@/domain/entities/CommissionStatement';

export class CommissionService {
  constructor(private readonly repo: ICommissionRepository) {}

  getStatement(from: string, to: string): Promise<CommissionStatement> {
    return this.repo.getStatement(from, to);
  }
}
