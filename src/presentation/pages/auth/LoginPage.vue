<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import { useAuth } from '@/presentation/composables/useAuth';
import { useI18n } from '@/presentation/composables/useI18n';
import { isLocalBackend } from '@/shared/utils/backend';

const { t } = useI18n();
const { signIn, loading } = useAuth();
const router = useRouter();
const route = useRoute();

// The demo account exists only in the local backend. Against Supabase it is a
// wrong password waiting to happen, and a hint that misleads anyone who reads it.
const demo = isLocalBackend();
const form = reactive(demo ? { email: 'admin@shefaa.eg', password: 'shefaa123' } : { email: '', password: '' });
const error = ref('');

// Each refusal has its own fix: a typo, the wrong account, or a connection.
const ERROR_KEYS: Record<string, string> = {
  INVALID_CREDENTIALS: 'invalidCredentials',
  NOT_ADMIN: 'notAdminAccount',
  ADMIN_CHECK_FAILED: 'adminCheckFailed',
  AUTH_UNREACHABLE: 'authUnreachable',
};

async function submit(): Promise<void> {
  error.value = '';
  try {
    await signIn({ email: form.email, password: form.password });
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
  } catch (e) {
    const code = e instanceof Error ? e.message : '';
    error.value = t.value(ERROR_KEYS[code] ?? 'invalidCredentials');
  }
}
</script>

<template>
  <form class="auth-card" @submit.prevent="submit">
    <div class="auth-logo"><AppIcon name="heart" :size="26" fill="#fff" /></div>
    <h1>{{ t('signIn') }}</h1>
    <p class="sub">{{ t('signInSub') }}</p>

    <div v-if="error" class="auth-err">{{ error }}</div>

    <FormField :label="t('email')">
      <input class="inp" type="email" v-model="form.email" placeholder="admin@shefaa.eg" />
    </FormField>
    <FormField :label="t('password')">
      <input class="inp" type="password" v-model="form.password" placeholder="••••••••" />
    </FormField>

    <BaseButton variant="primary" block type="submit" :disabled="loading">
      <AppIcon name="logout" :size="17" />{{ loading ? t('signingIn') : t('signIn') }}
    </BaseButton>

    <p v-if="demo" class="muted" style="text-align: center; font-size: 12px; margin: 16px 0 0">{{ t('demoHint') }}</p>
  </form>
</template>
