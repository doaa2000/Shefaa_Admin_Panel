import type { Locale } from '@/shared/types';
import { formatMoney } from '@/shared/utils/format';

/**
 * Immutable money value object (EGP). Encapsulates currency formatting so that
 * monetary amounts are never represented as bare numbers in the domain.
 */
export class Money {
  private constructor(public readonly amount: number) {}

  static fromEGP(amount: number): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Invalid money amount: ${amount}`);
    }
    return new Money(amount);
  }

  format(lang: Locale): string {
    return formatMoney(this.amount, lang);
  }

  valueOf(): number {
    return this.amount;
  }
}
