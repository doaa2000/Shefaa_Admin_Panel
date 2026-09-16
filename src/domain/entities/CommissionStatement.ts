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
}

export interface CommissionStatement {
  range: { from: string; to: string };
  totals: CommissionTotals;
  rows: CommissionRow[];
}
