import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Admin, Credentials } from '@/domain/entities/Admin';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<Admin | null>(null);
  const loading = ref(false);
  const restored = ref(false);

  const isAuthenticated = computed(() => admin.value !== null);
  const service = () => container.resolve(TOKENS.AuthService);

  async function signIn(credentials: Credentials): Promise<void> {
    loading.value = true;
    try {
      admin.value = await service().signIn(credentials);
    } finally {
      loading.value = false;
    }
  }

  async function signOut(): Promise<void> {
    await service().signOut();
    admin.value = null;
  }

  /** Restores a persisted session on app boot. */
  async function restore(): Promise<void> {
    if (restored.value) return;
    admin.value = await service().restore();
    restored.value = true;
  }

  return { admin, loading, restored, isAuthenticated, signIn, signOut, restore };
});
