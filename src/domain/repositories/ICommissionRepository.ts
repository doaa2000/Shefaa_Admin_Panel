import type { CommissionStatement } from '@/domain/entities/CommissionStatement';

export interface ICommissionRepository {
  /** The statement for one period. Dates are inclusive, as YYYY-MM-DD. */
  getStatement(from: string, to: string): Promise<CommissionStatement>;
}
