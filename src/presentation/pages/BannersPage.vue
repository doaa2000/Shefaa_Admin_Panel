<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import BannerFormModal from '@/presentation/components/banners/BannerFormModal.vue';
import { useBanners } from '@/presentation/composables/useBanners';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { formatNumber } from '@/shared/utils/format';
import type { Banner, BannerInput } from '@/domain/entities/Banner';

const { t, locale } = useI18n();
const { toast } = useToast();
const banners = useBanners();

const editing = ref<Banner | null>(null);
const showForm = ref(false);
const confirmTarget = ref<Banner | null>(null);

onMounted(() => banners.load());

function openCreate(): void {
  editing.value = null;
  showForm.value = true;
}
function openEdit(b: Banner): void {
  editing.value = b;
  showForm.value = true;
}

async function onSaved(input: BannerInput, isNew: boolean): Promise<void> {
  try {
    await banners.save(input);
    showForm.value = false;
    toast(isNew ? t.value('bannerAdded') : t.value('bannerUpdated'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onToggle(b: Banner): Promise<void> {
  try {
    await banners.toggleActive(b);
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onMove(b: Banner, direction: -1 | 1): Promise<void> {
  try {
    await banners.move(b, direction);
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onConfirmDelete(): Promise<void> {
  if (!confirmTarget.value) return;
  try {
    await banners.remove(confirmTarget.value.id);
    confirmTarget.value = null;
    toast(t.value('bannerDeleted'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <span class="muted" style="font-size: 13px; font-weight: 500">
        {{ formatNumber(banners.active.value.length, locale) }} {{ t('bannerActiveCount') }}
      </span>
      <div class="spacer" />
      <BaseButton variant="primary" @click="openCreate">
        <AppIcon name="plus" :size="18" />{{ t('addBanner') }}
      </BaseButton>
    </div>

    <div class="card">
      <LoadingState v-if="banners.loading.value && !banners.items.value.length" />
      <ErrorState
        v-else-if="banners.error.value"
        :message="banners.error.value"
        @retry="banners.load()"
      />
      <div v-else class="banner-grid">
        <article
          v-for="(b, i) in banners.items.value"
          :key="b.id"
          class="banner-card"
          :class="{ off: !b.isActive }"
        >
          <div class="banner-shot">
            <img :src="b.imageUrl" alt="" />
            <div v-if="b.title || b.subtitle" class="banner-text">
              <strong v-if="b.title">{{ b.title }}</strong>
              <span v-if="b.subtitle">{{ b.subtitle }}</span>
            </div>
            <span class="badge banner-flag" :class="b.isActive ? 'success' : 'info'">
              {{ b.isActive ? t('bannerActive') : t('bannerHidden') }}
            </span>
          </div>

          <div class="banner-bar">
            <span class="muted" style="font-size: 12.5px">
              {{ t('bannerPosition') }} {{ formatNumber(i + 1, locale) }}
            </span>
            <div class="spacer" />
            <div class="row-actions">
              <ActionButton
                icon="arrowUp"
                :title="t('bannerMoveUp')"
                :disabled="i === 0"
                @click="onMove(b, -1)"
              />
              <ActionButton
                icon="arrowDn"
                :title="t('bannerMoveDown')"
                :disabled="i === banners.items.value.length - 1"
                @click="onMove(b, 1)"
              />
              <ActionButton
                :icon="b.isActive ? 'power' : 'check'"
                :title="b.isActive ? t('bannerHide') : t('bannerShow')"
                @click="onToggle(b)"
              />
              <ActionButton icon="edit" :title="t('edit')" @click="openEdit(b)" />
              <ActionButton
                icon="trash"
                tone="danger"
                :title="t('delete')"
                @click="confirmTarget = b"
              />
            </div>
          </div>
        </article>

        <EmptyState v-if="!banners.items.value.length" icon="image" />
      </div>
    </div>

    <BannerFormModal
      v-if="showForm"
      :banner="editing"
      @close="showForm = false"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-if="confirmTarget"
      :title="t('deleteConfirm')"
      :message="`${confirmTarget.title || t('banner')} — ${t('deleteMsg')}`"
      @cancel="confirmTarget = null"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<style scoped>
.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px;
}
.banner-card {
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--surface);
}
/* A hidden banner stays visible to the admin, just clearly switched off. */
.banner-card.off .banner-shot img {
  filter: grayscale(1);
  opacity: 0.55;
}
.banner-shot {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--surface-2, #f4f6f8);
}
.banner-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.banner-text {
  position: absolute;
  inset: auto 12px 10px 12px;
  display: grid;
  gap: 2px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
  font-size: 12.5px;
}
.banner-flag {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
}
.banner-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
}
</style>
