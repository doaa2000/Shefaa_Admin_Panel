import type { DashboardStats } from '@/domain/entities/DashboardStats';

export interface IDashboardRepository {
  getStats(): Promise<DashboardStats>;
}
