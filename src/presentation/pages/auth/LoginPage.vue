<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import { useAuth } from '@/presentation/composables/useAuth';
import { useI18n } from '@/presentation/composables/useI18n';

const { t } = useI18n();
const { signIn, loading } = useAuth();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: 'admin@shefaa.eg', password: 'shefaa123' });
const error = ref('');

async function submit(): Promise<void> {
  error.value = '';
  try {
    await signIn({ email: form.email, password: form.password });
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
  } catch {
    error.value = t.value('invalidCredentials');
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

    <p class="muted" style="text-align: center; font-size: 12px; margin: 16px 0 0">{{ t('demoHint') }}</p>
  </form>
</template>
