import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import type { CommissionStatement } from '@/domain/entities/CommissionStatement';

/**
 * There is no demo version of this page, on purpose.
 *
 * The other local repositories serve seed data so the panel can be looked at
 * without a backend. Invented money is different in kind: a statement is what
 * a doctor gets invoiced from, and a convincing fake one is a number somebody
 * will act on. So this says plainly that it has nothing to show.
 */
const UNAVAILABLE =
  'The commission statement needs the real backend. The demo data has no money in it.';

export class LocalCommissionRepository implements ICommissionRepository {
  async getStatement(): Promise<CommissionStatement> {
    throw new Error(UNAVAILABLE);
  }

  async issue(): Promise<void> {
    throw new Error(UNAVAILABLE);
  }

  async settle(): Promise<void> {
    throw new Error(UNAVAILABLE);
  }

  async voidInvoice(): Promise<void> {
    throw new Error(UNAVAILABLE);
  }
}
