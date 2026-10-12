import type { Review } from '@/domain/entities/Review';

/** Read only. A review is the patient's to write; the admin reads them. */
export interface IReviewsRepository {
  list(): Promise<Review[]>;
}
