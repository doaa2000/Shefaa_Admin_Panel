import type { CommissionStatement } from '@/domain/entities/CommissionStatement';

export interface ICommissionRepository {
  /** The statement for one period. Dates are inclusive, as YYYY-MM-DD. */
  getStatement(from: string, to: string): Promise<CommissionStatement>;

  /** Raises the invoice for one doctor and one period, freezing its figures. */
  issue(doctorId: number, from: string, to: string): Promise<void>;

  /** Records that an invoice was paid. The note is whatever the owner needs to
   *  find the payment again: a transfer reference, "cash at the clinic". */
  settle(invoiceId: number, note?: string): Promise<void>;

  /** Withdraws one. The reason is required, and kept. */
  voidInvoice(invoiceId: number, reason: string): Promise<void>;
}
