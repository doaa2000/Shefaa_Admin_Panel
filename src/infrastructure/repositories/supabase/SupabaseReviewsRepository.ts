import type { IReviewsRepository } from '@/domain/repositories/IReviewsRepository';
import type { Review } from '@/domain/entities/Review';
import { getSupabaseClient } from '@/infrastructure/supabase/client';

interface ReviewRow {
  id: number;
  doctor_id: number;
  stars: number;
  comment: string | null;
  created_at: string;
  doctor: { name: string | null } | null;
  patient: { name: string | null } | null;
}

export class SupabaseReviewsRepository implements IReviewsRepository {
  private db = getSupabaseClient();

  /**
   * The table, not doctor_reviews_public: the public view has no note. The
   * table's policy opens every row to an admin and to nobody else but the
   * author and the doctor reviewed.
   */
  async list(): Promise<Review[]> {
    const { data, error } = await this.db
      .from('doctor_reviews')
      .select(
        'id, doctor_id, stars, comment, created_at, doctor:Doctors(name), patient:profiles(name)',
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as ReviewRow[]).map((r) => ({
      id: String(r.id),
      doctorId: String(r.doctor_id),
      doctorName: r.doctor?.name?.trim() ?? '',
      patientName: r.patient?.name?.trim() ?? '',
      stars: r.stars,
      comment: r.comment?.trim() || null,
      createdAt: r.created_at,
    }));
  }
}
