import type { IReviewsRepository } from '@/domain/repositories/IReviewsRepository';
import type { Review } from '@/domain/entities/Review';

export class ReviewsService {
  constructor(private readonly repo: IReviewsRepository) {}

  getAll(): Promise<Review[]> {
    return this.repo.list();
  }
}
