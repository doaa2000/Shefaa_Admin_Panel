import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/presentation/stores/auth.store';
import type { Credentials } from '@/domain/entities/Admin';

export function useAuth() {
  const store = useAuthStore();
  const { admin, loading, isAuthenticated } = storeToRefs(store);

  return {
    admin,
    loading,
    isAuthenticated,
    signIn: (credentials: Credentials) => store.signIn(credentials),
    signOut: () => store.signOut(),
    restore: () => store.restore(),
  };
}
