import type { EntityId } from '@/shared/types';

/**
 * A patient's rating of one visit, as the admin sees it.
 *
 * The note is here and nowhere public: the app shows other patients the stars
 * alone, and the note is read by the doctor it is about and by the admin
 * (Shefaa migration 0067).
 */
export interface Review {
  id: EntityId;
  doctorId: EntityId;
  doctorName: string;
  patientName: string;
  stars: number;
  /** Null when the patient left stars alone. */
  comment: string | null;
  createdAt: string;
}
