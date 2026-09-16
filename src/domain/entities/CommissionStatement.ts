/** One doctor's line on the platform's statement for a period. */
export interface CommissionRow {
  doctorId: number;
  doctorName: string;
  /** Bookings that were not cancelled: what the share is charged on. */
  bookings: number;
  /** The consultation fees on those bookings. */
  fees: number;
  /** The platform's share of them, at the rate each was booked under. */
  commission: number;
  /** fees - commission: what stays with the doctor. */
  net: number;
  cancelled: number;
  /** Of the cancellations, the ones the doctor's own account made. Not an
   *  accusation -- a number worth seeing before it becomes a habit. */
  cancelledByDoctor: number;
  /** Charged, and reported apart: only the clinic can say a patient did not
   *  arrive, so it is an objection to be looked at, not a switch. */
  noShow: number;
  /** Bookings taken before there was a share, carrying none. */
  unrated: number;

  /** The invoice raised for this doctor and this exact period, if there is
   *  one. Null until the month is billed; a voided invoice frees the period
   *  and reads as null again. */
  invoiceId: number | null;
  invoiceStatus: 'issued' | 'paid' | null;
  /** What the invoice claimed when it was raised. It does not follow the
   *  figure above: a bill that changes after it was sent is not a bill. */
  invoicedCommission: number | null;
  invoicePaidAt: string | null;
}

export interface CommissionTotals {
  doctors: number;
  bookings: number;
  fees: number;
  commission: number;
  net: number;
  cancelled: number;
  noShow: number;
  unrated: number;
  /** Billed for this period, and of that, actually collected. */
  invoiced: number;
  collected: number;
}

export interface CommissionStatement {
  range: { from: string; to: string };
  totals: CommissionTotals;
  rows: CommissionRow[];
}
