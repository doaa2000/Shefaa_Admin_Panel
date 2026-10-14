import type { IReviewsRepository } from '@/domain/repositories/IReviewsRepository';
import type { Review } from '@/domain/entities/Review';
import { delay } from './LocalDatabase';

/**
 * Empty, like the banners: reviews are what real patients wrote, and invented
 * ones about doctors with real names in the seed would read as if they were.
 */
export class LocalReviewsRepository implements IReviewsRepository {
  list(): Promise<Review[]> {
    return delay([]);
  }
}
