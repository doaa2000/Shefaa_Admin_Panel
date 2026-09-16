import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CommissionStatement } from '@/domain/entities/CommissionStatement';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

/** YYYY-MM-DD in the clinic's own day. toISOString would hand back UTC, which
 *  late in a Cairo evening is already tomorrow -- and would put the last day of
 *  a month into the next one. */
function isoDay(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** The first and last day of a month, as the statement takes them. */
export function monthRange(year: number, month: number): { from: string; to: string } {
  return {
    from: isoDay(new Date(year, month, 1)),
    to: isoDay(new Date(year, month + 1, 0)),
  };
}

export const useCommissionStore = defineStore('commission', () => {
  const now = new Date();

  const year = ref(now.getFullYear());
  const month = ref(now.getMonth());

  const statement = ref<CommissionStatement | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const service = () => container.resolve(TOKENS.CommissionService);

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;
    const range = monthRange(year.value, month.value);
    try {
      statement.value = await service().getStatement(range.from, range.to);
    } catch (e) {
      error.value = (e as Error).message;
      // Cleared rather than left behind: last month's figures under this
      // month's heading is the kind of mistake nobody catches.
      statement.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function setMonth(nextYear: number, nextMonth: number): Promise<void> {
    year.value = nextYear;
    month.value = nextMonth;
    await load();
  }

  /** One month back or forward, rolling the year over. */
  async function step(direction: -1 | 1): Promise<void> {
    const d = new Date(year.value, month.value + direction, 1);
    await setMonth(d.getFullYear(), d.getMonth());
  }

  /** The three settling actions. Each reloads afterwards rather than patching
   *  the row: the invoice freezes figures the statement does not, and guessing
   *  here at what the database decided is how the two start to differ. */
  async function issue(doctorId: number): Promise<void> {
    const range = monthRange(year.value, month.value);
    await service().issue(doctorId, range.from, range.to);
    await load();
  }

  async function settle(invoiceId: number, note?: string): Promise<void> {
    await service().settle(invoiceId, note);
    await load();
  }

  async function voidInvoice(invoiceId: number, reason: string): Promise<void> {
    await service().voidInvoice(invoiceId, reason);
    await load();
  }

  return {
    year,
    month,
    statement,
    loading,
    error,
    load,
    setMonth,
    step,
    issue,
    settle,
    voidInvoice,
  };
});
