import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import type { CommissionStatement } from '@/domain/entities/CommissionStatement';
import { getSupabaseClient } from '@/infrastructure/supabase/client';
import { describeWriteError } from './writeGuards';

/**
 * What each doctor owes, counted by `admin_commission_statement`.
 *
 * Every figure is the database's, computed from the rate written onto each
 * booking when it was made. Nothing is recomputed here: a second opinion about
 * money is how two numbers start to differ, and this is the one a doctor will
 * be invoiced from.
 */
export class SupabaseCommissionRepository implements ICommissionRepository {
  private db = getSupabaseClient();

  async getStatement(from: string, to: string): Promise<CommissionStatement> {
    const { data, error } = await this.db.rpc('admin_commission_statement', {
      p_from: from,
      p_to: to,
    });
    if (error) throw await describeWriteError(error, this.db);
    if (!data) throw new Error('The statement came back empty.');
    return data as unknown as CommissionStatement;
  }
}
