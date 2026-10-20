<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
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
import { validateDoctorForm, validateNewClinic, hasErrors } from '@/application/validation/validators';
import { useToast } from '@/presentation/composables/useToast';
import type { SelectOption } from '@/presentation/components/ui/types';

const props = defineProps<{ doctor: Doctor | null; specializations: Specialization[] }>();
const emit = defineEmits<{ close: []; saved: [input: DoctorInput, isNew: boolean] }>();

const { t, locale } = useI18n();
const { toast } = useToast();
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

/**
 * The clinic is picked from those already made, or made here.
 *
 * It used to be pick-only, and a clinic could only be made on the Locations
 * page, by name alone: with no clinics yet the list was empty, and there was
 * nowhere at all to say where a clinic is. Now the address goes with the
 * clinic in both cases -- an existing clinic's can be filled in or corrected
 * from here, since most were made before it was asked for.
 */
const clinicMode = ref<'existing' | 'new'>('existing');
const clinicAddress = ref('');
const newClinic = reactive({ govId: '', cityId: '', name: '', address: '' });
const saving = ref(false);

const clinics = computed(() => locationsService.flattenClinics(locationsStore.tree));
const selectedClinic = computed(() => clinics.value.find((c) => c.value === form.clinicId));

onMounted(async () => {
  await locationsStore.fetchTree();
  // Nothing to pick from: start where the admin will have to go anyway.
  if (!form.clinicId && !clinics.value.length) clinicMode.value = 'new';
});

// The address shown is the chosen clinic's own, so switching clinics shows
// that one's -- and an edit is only written back if it differs from it.
watch(
  selectedClinic,
  (c) => {
    clinicAddress.value = c?.address ?? '';
  },
  { immediate: true },
);

const clinicOptions = computed<SelectOption[]>(() =>
  clinics.value.map((c) => ({
    value: c.value,
    label: locationsService.clinicOptionLabel(c, locale.value),
  })),
);

const govOptions = computed<SelectOption[]>(() =>
  locationsStore.tree.map((g) => ({ value: g.id, label: locale.value === 'ar' ? g.nameAr : g.nameEn })),
);
const cityOptions = computed<SelectOption[]>(() =>
  (locationsStore.tree.find((g) => g.id === newClinic.govId)?.cities ?? []).map((c) => ({
    value: c.id,
    label: locale.value === 'ar' ? c.nameAr : c.nameEn,
  })),
);
// A city belongs to one governorate; a new governorate means choosing again.
watch(
  () => newClinic.govId,
  () => {
    if (!cityOptions.value.some((c) => c.value === newClinic.cityId)) newClinic.cityId = '';
  },
);

const specOptions = computed<SelectOption[]>(() =>
  props.specializations.map((s) => ({ value: s.id, label: locale.value === 'ar' ? s.nameAr : s.nameEn })),
);

const statusOptions = computed<SelectOption[]>(() => [
  { value: DoctorStatus.Active, label: t.value('active') },
  { value: DoctorStatus.Inactive, label: t.value('inactive') },
]);

const previewName = computed(() => form.nameEn);

/**
 * Saves the clinic side first and returns the clinic's id, or null if that
 * failed. A clinic made here is then selected as an existing one, so pressing
 * save again after the doctor itself fails does not make it twice.
 */
async function saveClinic(): Promise<string | null> {
  try {
    if (clinicMode.value === 'new') {
      const name = newClinic.name.trim();
      const id = await locationsStore.saveClinic({
        cityId: newClinic.cityId,
        nameEn: name,
        nameAr: name,
        address: newClinic.address,
      });
      form.clinicId = String(id);
      clinicMode.value = 'existing';
      Object.assign(newClinic, { govId: '', cityId: '', name: '', address: '' });
      return form.clinicId;
    }
    const c = selectedClinic.value;
    if (c && clinicAddress.value.trim() !== c.address.trim()) {
      await locationsStore.saveClinic({
        id: c.value,
        cityId: c.cityId,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        address: clinicAddress.value,
      });
    }
    return form.clinicId;
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
    return null;
  }
}

async function submit(): Promise<void> {
  if (saving.value) return;
  const isNewClinic = clinicMode.value === 'new';
  const result = validateDoctorForm(
    {
      nameEn: form.nameEn,
      specializationId: form.specializationId,
      // Checked below instead, field by field, when the clinic is new.
      clinicId: isNewClinic ? 'new' : form.clinicId,
      fee: form.fee,
    },
    t.value('required'),
  );
  const clinicResult = isNewClinic
    ? validateNewClinic({ cityId: newClinic.cityId, name: newClinic.name }, t.value('required'))
    : {};
  Object.assign(
    errors,
    {
      nameEn: undefined,
      specializationId: undefined,
      clinicId: undefined,
      fee: undefined,
      clinicCity: undefined,
      clinicName: undefined,
    },
    result,
    clinicResult,
  );
  if (hasErrors(result) || hasErrors(clinicResult)) return;

  saving.value = true;
  const clinicId = await saveClinic();
  saving.value = false;
  if (!clinicId) return;

  const input: DoctorInput = {
    id: props.doctor?.id,
    nameEn: form.nameEn,
    nameAr: form.nameAr,
    email: form.email,
    specializationId: form.specializationId,
    clinicId,
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
      <FormField :label="t('fee')" :error="errors.fee">
        <div class="inp-prefix">
          <span class="pfx">{{ feePrefix }}</span>
          <input class="inp num" type="number" v-model="form.fee" placeholder="500" />
        </div>
      </FormField>
    </div>

    <FormField :label="t('status')">
      <BaseSelect v-model="form.status" :options="statusOptions" />
    </FormField>

    <FormField :label="t('assignedClinic')">
      <div class="chip-row">
        <button
          type="button"
          class="chip-sel"
          :class="{ on: clinicMode === 'existing' }"
          @click="clinicMode = 'existing'"
        >
          {{ t('clinicExisting') }}
        </button>
        <button
          type="button"
          class="chip-sel"
          :class="{ on: clinicMode === 'new' }"
          style="display: inline-flex; align-items: center; gap: 5px"
          @click="clinicMode = 'new'"
        >
          <AppIcon name="plus" :size="13" />{{ t('clinicNew') }}
        </button>
      </div>
    </FormField>

    <template v-if="clinicMode === 'existing'">
      <FormField
        :label="t('clinic')"
        :error="errors.clinicId"
        :hint="clinicOptions.length ? undefined : t('noClinicsYet')"
      >
        <BaseSelect v-model="form.clinicId" :options="clinicOptions" :placeholder="t('selectClinic')" />
      </FormField>
      <FormField v-if="selectedClinic" :label="t('clinicAddress')" :hint="t('clinicAddressHint')">
        <textarea class="ta" v-model="clinicAddress" />
      </FormField>
    </template>

    <template v-else>
      <div class="field-row">
        <FormField :label="t('governorate')">
          <BaseSelect v-model="newClinic.govId" :options="govOptions" :placeholder="t('selectGov')" />
        </FormField>
        <FormField
          :label="t('city')"
          :error="errors.clinicCity"
          :hint="newClinic.govId && !cityOptions.length ? t('noCitiesYet') : undefined"
        >
          <BaseSelect v-model="newClinic.cityId" :options="cityOptions" :placeholder="t('selectCity')" />
        </FormField>
      </div>
      <FormField :label="t('clinicName')" :error="errors.clinicName">
        <input class="inp" v-model="newClinic.name" />
      </FormField>
      <FormField :label="t('clinicAddress')" :hint="t('clinicAddressHint')">
        <textarea class="ta" v-model="newClinic.address" />
      </FormField>
    </template>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" :disabled="saving" @click="submit">
        {{ isNew ? t('addDoctor') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
