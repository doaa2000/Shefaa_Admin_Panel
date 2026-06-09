<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import BaseSelect from '@/presentation/components/ui/BaseSelect.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { Specialization } from '@/domain/entities/Specialization';
import { DoctorStatus } from '@/domain/enums';
import { useI18n } from '@/presentation/composables/useI18n';
import { useLocationsStore } from '@/presentation/stores/locations.store';
import { container } from '@/providers/container';
import { TOKENS } from '@/providers/tokens';
import { validateDoctorForm, hasErrors } from '@/application/validation/validators';
import type { SelectOption } from '@/presentation/components/ui/types';

const props = defineProps<{ doctor: Doctor | null; specializations: Specialization[] }>();
const emit = defineEmits<{ close: []; saved: [input: DoctorInput, isNew: boolean] }>();

const { t, locale } = useI18n();
const locationsStore = useLocationsStore();
const locationsService = container.resolve(TOKENS.LocationsService);

const isNew = computed(() => !props.doctor?.id);

const form = reactive({
  nameEn: props.doctor?.nameEn ?? '',
  nameAr: props.doctor?.nameAr ?? '',
  email: props.doctor?.email ?? '',
  specializationId: props.doctor?.specializationId ?? '',
  clinicId: props.doctor?.clinicId ?? '',
  fee: props.doctor?.fee ? String(props.doctor.fee) : '',
  status: props.doctor?.status ?? DoctorStatus.Active,
});
const errors = reactive<Record<string, string | undefined>>({});

onMounted(() => locationsStore.fetchTree());

const clinicOptions = computed<SelectOption[]>(() =>
  locationsService.flattenClinics(locationsStore.tree).map((c) => ({
    value: c.value,
    label: locationsService.clinicOptionLabel(c, locale.value),
  })),
);

const specOptions = computed<SelectOption[]>(() =>
  props.specializations.map((s) => ({ value: s.id, label: locale.value === 'ar' ? s.nameAr : s.nameEn })),
);

const statusOptions = computed<SelectOption[]>(() => [
  { value: DoctorStatus.Active, label: t.value('active') },
  { value: DoctorStatus.Inactive, label: t.value('inactive') },
]);

const previewName = computed(() => form.nameEn);

function submit(): void {
  const result = validateDoctorForm(
    { nameEn: form.nameEn, specializationId: form.specializationId, clinicId: form.clinicId, fee: form.fee },
    t.value('required'),
  );
  Object.assign(errors, { nameEn: undefined, specializationId: undefined, clinicId: undefined, fee: undefined }, result);
  if (hasErrors(result)) return;

  const input: DoctorInput = {
    id: props.doctor?.id,
    nameEn: form.nameEn,
    nameAr: form.nameAr,
    email: form.email,
    specializationId: form.specializationId,
    clinicId: form.clinicId,
    fee: Number(form.fee),
    status: form.status as DoctorStatus,
  };
  emit('saved', input, isNew.value);
}
const feePrefix = computed(() => (locale.value === 'ar' ? 'ج.م' : 'EGP'));
</script>

<template>
  <BaseModal
    wide
    :title="isNew ? t('addDoctor') : t('editDoctor')"
    :subtitle="isNew ? t('sub_doctors') : locale === 'ar' ? doctor?.nameAr : doctor?.nameEn"
    @close="emit('close')"
  >
    <div class="avatar-pick" style="margin-bottom: 22px">
      <AppAvatar v-if="previewName" :name="previewName" :color="doctor?.color ?? '#67B2D8'" :size="64" />
      <div v-else class="avatar-up"><AppIcon name="user" :size="26" /></div>
      <div>
        <div class="fw6" style="font-size: 14px">{{ t('photo') }}</div>
        <div class="muted" style="font-size: 12.5px; margin-bottom: 8px">PNG / JPG · 1:1</div>
        <BaseButton variant="soft" small type="button">{{ t('uploadPhoto') }}</BaseButton>
      </div>
    </div>

    <div class="field-row">
      <FormField :label="`${t('name')} (EN)`" :error="errors.nameEn">
        <input class="inp" v-model="form.nameEn" placeholder="Dr. Ahmed El-Sayed" />
      </FormField>
      <FormField :label="`${t('name')} (ع)`">
        <input class="inp" dir="rtl" v-model="form.nameAr" placeholder="د. أحمد السيد" />
      </FormField>
    </div>

    <FormField :label="t('email')">
      <input class="inp" type="email" v-model="form.email" placeholder="name@shefaa.eg" />
    </FormField>

    <div class="field-row">
      <FormField :label="t('specialization')" :error="errors.specializationId">
        <BaseSelect
          v-model="form.specializationId"
          :options="specOptions"
          :placeholder="t('selectSpecialization')"
        />
      </FormField>
      <FormField :label="t('assignedClinic')" :error="errors.clinicId">
        <BaseSelect v-model="form.clinicId" :options="clinicOptions" :placeholder="t('selectClinic')" />
      </FormField>
    </div>

    <div class="field-row">
      <FormField :label="t('fee')" :error="errors.fee">
        <div class="inp-prefix">
          <span class="pfx">{{ feePrefix }}</span>
          <input class="inp num" type="number" v-model="form.fee" placeholder="500" />
        </div>
      </FormField>
      <FormField :label="t('status')">
        <BaseSelect v-model="form.status" :options="statusOptions" />
      </FormField>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" @click="submit">
        {{ isNew ? t('addDoctor') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
