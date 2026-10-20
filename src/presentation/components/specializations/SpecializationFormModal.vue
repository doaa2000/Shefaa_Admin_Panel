<script setup lang="ts">
import { computed, reactive } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import SpecGlyph from '@/presentation/components/ui/SpecGlyph.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';
import { useI18n } from '@/presentation/composables/useI18n';
import { validateSpecializationForm, hasErrors } from '@/application/validation/validators';

const SPEC_ICONS = ['heart', 'sparkle', 'baby', 'bone', 'tooth', 'brain', 'eye', 'ear', 'stethoscope', 'services'];
// The glyph's one color; specialties do not choose their own any more.
const ACCENT = '#4A93BC';

const props = defineProps<{ spec: Specialization | null }>();
const emit = defineEmits<{ close: []; saved: [input: SpecializationInput, isNew: boolean] }>();

const { t, locale } = useI18n();
const isNew = computed(() => !props.spec?.id);

const form = reactive({
  nameEn: props.spec?.nameEn ?? '',
  nameAr: props.spec?.nameAr ?? '',
  icon: props.spec?.icon ?? 'stethoscope',
});
const errors = reactive<Record<string, string | undefined>>({});

const previewName = computed(
  () => (locale.value === 'ar' ? form.nameAr : form.nameEn) || t.value('specializationName'),
);

function submit(): void {
  const result = validateSpecializationForm(
    { nameEn: form.nameEn },
    t.value('required'),
  );
  Object.assign(errors, { nameEn: undefined }, result);
  if (hasErrors(result)) return;

  emit(
    'saved',
    {
      id: props.spec?.id,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      icon: form.icon,
    },
    isNew.value,
  );
}
</script>

<template>
  <BaseModal
    :title="isNew ? t('addSpecialization') : t('editSpecialization')"
    :subtitle="t('sub_specializations')"
    @close="emit('close')"
  >
    <div class="avatar-pick" style="margin-bottom: 22px">
      <SpecGlyph :icon="form.icon" :size="56" :box="56" />
      <div class="fw6" style="font-size: 15px">{{ previewName }}</div>
    </div>

    <div class="field-row">
      <FormField :label="`${t('specializationName')} (EN)`" :error="errors.nameEn">
        <input class="inp" v-model="form.nameEn" placeholder="Dentistry" />
      </FormField>
      <FormField :label="`${t('specializationName')} (ع)`">
        <input class="inp" dir="rtl" v-model="form.nameAr" placeholder="الأسنان" />
      </FormField>
    </div>

    <FormField :label="t('icon')">
      <div class="chip-row">
        <button
          v-for="ic in SPEC_ICONS"
          :key="ic"
          type="button"
          :style="{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--r-md)',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid ' + (form.icon === ic ? ACCENT : 'var(--border)'),
            background: form.icon === ic ? ACCENT + '1F' : 'var(--surface)',
            color: form.icon === ic ? ACCENT : 'var(--text-3)',
            boxShadow: form.icon === ic ? '0 0 0 3px ' + ACCENT + '26' : 'none',
            transition: 'all .14s',
          }"
          @click="form.icon = ic"
        >
          <AppIcon :name="ic" :size="20" />
        </button>
      </div>
    </FormField>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" @click="submit">
        {{ isNew ? t('addSpecialization') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
