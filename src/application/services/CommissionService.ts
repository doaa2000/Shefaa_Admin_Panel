import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import type { CommissionStatement } from '@/domain/entities/CommissionStatement';

export class CommissionService {
  constructor(private readonly repo: ICommissionRepository) {}

  getStatement(from: string, to: string): Promise<CommissionStatement> {
    return this.repo.getStatement(from, to);
  }

  issue(doctorId: number, from: string, to: string): Promise<void> {
    return this.repo.issue(doctorId, from, to);
  }

  settle(invoiceId: number, note?: string): Promise<void> {
    return this.repo.settle(invoiceId, note);
  }

  voidInvoice(invoiceId: number, reason: string): Promise<void> {
    return this.repo.voidInvoice(invoiceId, reason);
  }
}
