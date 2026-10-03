<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import type { Campaign, CampaignInput, CampaignStatus } from '@/domain/entities/Campaign';
import { useI18n } from '@/presentation/composables/useI18n';
import { useCampaigns } from '@/presentation/composables/useCampaigns';

/** Big enough to look sharp on a phone, small enough not to stall the carousel. */
const MAX_BYTES = 5 * 1024 * 1024;

const props = defineProps<{ campaign: Campaign | null }>();
const emit = defineEmits<{ close: []; saved: [input: CampaignInput, isNew: boolean] }>();

const { t } = useI18n();
const campaigns = useCampaigns();
const isNew = computed(() => !props.campaign?.id);

const form = reactive({
  title: props.campaign?.title ?? '',
  body: props.campaign?.body ?? '',
  imageUrl: props.campaign?.imageUrl ?? '',
  governorateId: props.campaign?.governorateId ?? '',
  cityId: props.campaign?.cityId ?? '',
  venue: props.campaign?.venue ?? '',
  startsOn: props.campaign?.startsOn ?? campaigns.today(),
  endsOn: props.campaign?.endsOn ?? campaigns.today(),
  startTime: props.campaign?.startTime ?? '',
  endTime: props.campaign?.endTime ?? '',
  status: (props.campaign?.status ?? 'draft') as CampaignStatus,
});

const errors = reactive<Record<string, string | undefined>>({});
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const cities = computed(() => campaigns.cityOptions(String(form.governorateId)));

// A city belongs to one governorate, and the database refuses one from
// anywhere else. Changing the governorate without clearing the city would
// submit that refusal.
watch(
  () => form.governorateId,
  () => {
    if (!cities.value.some((c) => String(c.value) === String(form.cityId))) {
      form.cityId = '';
    }
  },
);

// An end before the start is not a range. Carried rather than refused: the
// admin is far more often fixing a one-day convoy than typing them backwards.
watch(
  () => form.startsOn,
  (value) => {
    if (form.endsOn < value) form.endsOn = value;
  },
);

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
    form.imageUrl = await campaigns.uploadImage(file);
  } catch (err) {
    errors.imageUrl = (err as Error).message;
  } finally {
    uploading.value = false;
    // Clearing the input lets the same file be picked again after a failure.
    if (fileInput.value) fileInput.value.value = '';
  }
}

function submit(): void {
  // The picture is the optional one here, which is the opposite of a banner: a
  // convoy is its words, and waiting for a designer is worse than a plain card
  // carrying the title and the dates.
  errors.title = form.title.trim() ? undefined : t.value('campaignTitleRequired');
  errors.body = form.body.trim() ? undefined : t.value('campaignBodyRequired');
  errors.endsOn =
    form.endsOn >= form.startsOn ? undefined : t.value('campaignEndBeforeStart');
  errors.endTime =
    !form.startTime || !form.endTime || form.endTime > form.startTime
      ? undefined
      : t.value('campaignEndTimeBeforeStart');

  if (errors.title || errors.body || errors.endsOn || errors.endTime) return;

  emit(
    'saved',
    {
      id: props.campaign?.id,
      title: form.title,
      body: form.body,
      imageUrl: form.imageUrl,
      governorateId: form.governorateId,
      cityId: form.cityId,
      venue: form.venue,
      startsOn: form.startsOn,
      endsOn: form.endsOn,
      startTime: form.startTime,
      endTime: form.endTime,
      status: form.status,
    },
    isNew.value,
  );
}
</script>

<template>
  <BaseModal
    :title="isNew ? t('addCampaign') : t('editCampaign')"
    :subtitle="t('sub_campaigns')"
    @close="emit('close')"
  >
    <FormField :label="t('campaignTitle')" :error="errors.title">
      <input class="inp" dir="rtl" v-model="form.title" placeholder="قافلة طبية مجانية" />
    </FormField>

    <FormField :label="t('campaignBody')" :hint="t('campaignBodyHint')" :error="errors.body">
      <textarea
        class="inp"
        dir="rtl"
        rows="4"
        v-model="form.body"
        placeholder="باطنة وأطفال ورمد. الكشف والعلاج مجانًا."
      />
    </FormField>

    <!-- Said before the governorate is chosen, because empty is a choice here
         and an empty select looks like an unfilled field. -->
    <FormField :label="t('campaignGovernorate')" :hint="t('campaignGovernorateHint')">
      <select class="inp" v-model="form.governorateId">
        <option value="">{{ t('campaignNationwide') }}</option>
        <option v-for="g in campaigns.governorateOptions.value" :key="g.value" :value="g.value">
          {{ g.label }}
        </option>
      </select>
    </FormField>

    <FormField v-if="form.governorateId" :label="t('campaignCity')">
      <select class="inp" v-model="form.cityId">
        <option value="">{{ t('campaignWholeGovernorate') }}</option>
        <option v-for="c in cities" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </FormField>

    <FormField :label="t('campaignVenue')" :hint="t('campaignVenueHint')">
      <input class="inp" dir="rtl" v-model="form.venue" placeholder="مدرسة أسوان الثانوية" />
    </FormField>

    <div class="pair">
      <FormField :label="t('campaignStartsOn')">
        <input class="inp" type="date" v-model="form.startsOn" />
      </FormField>
      <FormField :label="t('campaignEndsOn')" :error="errors.endsOn">
        <input class="inp" type="date" v-model="form.endsOn" :min="form.startsOn" />
      </FormField>
    </div>

    <div class="pair">
      <FormField :label="t('campaignStartTime')" :hint="t('campaignHoursHint')">
        <input class="inp" type="time" v-model="form.startTime" />
      </FormField>
      <FormField :label="t('campaignEndTime')" :error="errors.endTime">
        <input class="inp" type="time" v-model="form.endTime" />
      </FormField>
    </div>

    <FormField :label="t('campaignStatus')" :hint="t('campaignStatusHint')">
      <select class="inp" v-model="form.status">
        <option value="draft">{{ t('campaignDraft') }}</option>
        <option value="announced">{{ t('campaignAnnounced') }}</option>
        <option value="postponed">{{ t('campaignPostponed') }}</option>
        <option value="cancelled">{{ t('campaignCancelled') }}</option>
      </select>
    </FormField>

    <FormField :label="t('campaignImage')" :hint="t('campaignImageHint')" :error="errors.imageUrl">
      <div class="banner-pick">
        <div class="banner-preview">
          <img v-if="form.imageUrl" :src="form.imageUrl" alt="" />
          <AppIcon v-else name="image" :size="26" />
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

    <!-- The one thing this form does not do. Saving must never send, so the
         button that sends is not in here. -->
    <p class="note">{{ t('campaignSaveDoesNotSend') }}</p>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" :disabled="uploading" @click="submit">
        {{ isNew ? t('addCampaign') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 520px) {
  .pair {
    grid-template-columns: 1fr;
  }
}
.note {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text-3);
}
textarea.inp {
  resize: vertical;
}
</style>
