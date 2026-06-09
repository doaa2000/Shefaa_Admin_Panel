<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import { useI18n } from '@/presentation/composables/useI18n';

const { t } = useI18n();
const router = useRouter();
</script>

<template>
  <div class="empty" style="padding-top: 80px">
    <div class="ico" style="font-size: 28px; font-weight: 700; color: var(--accent-deep)">404</div>
    <h4>{{ t('notFound') }}</h4>
    <p>{{ t('notFoundMsg') }}</p>
    <div style="margin-top: 16px">
      <BaseButton variant="primary" @click="router.push({ name: 'dashboard' })">
        {{ t('backHome') }}
      </BaseButton>
    </div>
  </div>
</template>
