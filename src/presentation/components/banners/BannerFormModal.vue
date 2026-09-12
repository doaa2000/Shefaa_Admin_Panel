<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import type { Banner, BannerInput } from '@/domain/entities/Banner';
import { useI18n } from '@/presentation/composables/useI18n';
import { useBanners } from '@/presentation/composables/useBanners';

/** Big enough to look sharp on a phone, small enough not to stall the carousel. */
const MAX_BYTES = 5 * 1024 * 1024;

const props = defineProps<{ banner: Banner | null }>();
const emit = defineEmits<{ close: []; saved: [input: BannerInput, isNew: boolean] }>();

const { t } = useI18n();
const banners = useBanners();
const isNew = computed(() => !props.banner?.id);

const form = reactive({
  imageUrl: props.banner?.imageUrl ?? '',
  title: props.banner?.title ?? '',
  subtitle: props.banner?.subtitle ?? '',
  isActive: props.banner?.isActive ?? true,
});
const errors = reactive<{ imageUrl?: string }>({});
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

async function onFile(e: Event): Promise<void> {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  errors.imageUrl = undefined;
  if (!file.type.startsWith('image/')) {
    errors.imageUrl = t.value('bannerNotAnImage');
    return;
  }
  if (file.size > MAX_BYTES) {
    errors.imageUrl = t.value('bannerTooLarge');
    return;
  }

  uploading.value = true;
  try {
    form.imageUrl = await banners.uploadImage(file);
  } catch (err) {
    errors.imageUrl = (err as Error).message;
  } finally {
    uploading.value = false;
    // Clearing the input lets the same file be picked again after a failure.
    if (fileInput.value) fileInput.value.value = '';
  }
}

function submit(): void {
  // A banner is a picture. Without one there is nothing to show, so this is the
  // only field that is genuinely required.
  errors.imageUrl = form.imageUrl ? undefined : t.value('bannerImageRequired');
  if (errors.imageUrl) return;

  emit(
    'saved',
    {
      id: props.banner?.id,
      imageUrl: form.imageUrl,
      title: form.title,
      subtitle: form.subtitle,
      sortOrder: props.banner?.sortOrder ?? banners.nextSortOrder.value,
      isActive: form.isActive,
    },
    isNew.value,
  );
}
</script>

<template>
  <BaseModal
    :title="isNew ? t('addBanner') : t('editBanner')"
    :subtitle="t('sub_banners')"
    @close="emit('close')"
  >
    <FormField :label="t('bannerImage')" :hint="t('bannerImageHint')" :error="errors.imageUrl">
      <div class="banner-pick">
        <div class="banner-preview">
          <img v-if="form.imageUrl" :src="form.imageUrl" alt="" />
          <AppIcon v-else name="image" :size="26" />
          <div v-if="form.title || form.subtitle" class="banner-preview-text">
            <strong v-if="form.title">{{ form.title }}</strong>
            <span v-if="form.subtitle">{{ form.subtitle }}</span>
          </div>
        </div>
        <div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFile"
          />
          <BaseButton variant="soft" :disabled="uploading" @click="fileInput?.click()">
            <AppIcon name="plus" :size="16" />
            {{ uploading ? t('bannerUploading') : t('bannerChooseImage') }}
          </BaseButton>
        </div>
      </div>
    </FormField>

    <FormField :label="t('bannerTitle')" :hint="t('bannerTextOptional')">
      <input class="inp" dir="rtl" v-model="form.title" placeholder="عروض الكشف" />
    </FormField>

    <FormField :label="t('bannerSubtitle')">
      <input class="inp" dir="rtl" v-model="form.subtitle" placeholder="خصم على أول زيارة" />
    </FormField>

    <FormField :label="t('status')">
      <label class="check-row">
        <input type="checkbox" v-model="form.isActive" />
        <span>{{ t('bannerActiveLabel') }}</span>
      </label>
    </FormField>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" :disabled="uploading" @click="submit">
        {{ isNew ? t('addBanner') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.banner-pick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.banner-preview {
  position: relative;
  width: 200px;
  aspect-ratio: 16 / 9;
  border-radius: var(--r-md);
  border: 1px solid var(--border);
  background: var(--surface-2, #f4f6f8);
  color: var(--text-3);
  overflow: hidden;
  display: grid;
  place-items: center;
  flex: none;
}
.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-preview-text {
  position: absolute;
  inset: auto 10px 8px 10px;
  display: grid;
  gap: 2px;
  color: #fff;
  text-align: start;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  font-size: 12px;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
}
</style>
