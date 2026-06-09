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
import { formatMoney } from '@/shared/utils/format';

const SPEC_ICONS = ['heart', 'sparkle', 'baby', 'bone', 'tooth', 'brain', 'eye', 'ear', 'stethoscope', 'services'];
const SPEC_COLORS = ['#D6533F', '#C98A1E', '#67B2D8', '#5A8FB0', '#7B6FCB', '#9B7BC9', '#4A93BC', '#2E9E73', '#D67BA0', '#6B7785'];

const props = defineProps<{ spec: Specialization | null }>();
const emit = defineEmits<{ close: []; saved: [input: SpecializationInput, isNew: boolean] }>();

const { t, locale } = useI18n();
const isNew = computed(() => !props.spec?.id);

const form = reactive({
  nameEn: props.spec?.nameEn ?? '',
  nameAr: props.spec?.nameAr ?? '',
  descEn: props.spec?.descEn ?? '',
  descAr: props.spec?.descAr ?? '',
  icon: props.spec?.icon ?? 'stethoscope',
  color: props.spec?.color ?? SPEC_COLORS[0],
  baseFee: props.spec?.baseFee ? String(props.spec.baseFee) : '',
});
const errors = reactive<Record<string, string | undefined>>({});

const previewName = computed(
  () => (locale.value === 'ar' ? form.nameAr : form.nameEn) || t.value('specializationName'),
);
const previewFee = computed(() => (form.baseFee ? formatMoney(Number(form.baseFee), locale.value) : '—'));
const feePrefix = computed(() => (locale.value === 'ar' ? 'ج.م' : 'EGP'));

function submit(): void {
  const result = validateSpecializationForm(
    { nameEn: form.nameEn, baseFee: form.baseFee },
    t.value('required'),
  );
  Object.assign(errors, { nameEn: undefined, baseFee: undefined }, result);
  if (hasErrors(result)) return;

  emit(
    'saved',
    {
      id: props.spec?.id,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      descEn: form.descEn,
      descAr: form.descAr,
      icon: form.icon,
      color: form.color,
      baseFee: Number(form.baseFee),
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
      <SpecGlyph :icon="form.icon" :color="form.color" :size="56" :box="56" />
      <div>
        <div class="fw6" style="font-size: 15px">{{ previewName }}</div>
        <div class="muted" style="font-size: 12.5px">{{ previewFee }}</div>
      </div>
    </div>

    <div class="field-row">
      <FormField :label="`${t('specializationName')} (EN)`" :error="errors.nameEn">
        <input class="inp" v-model="form.nameEn" placeholder="Dentistry" />
      </FormField>
      <FormField :label="`${t('specializationName')} (ع)`">
        <input class="inp" dir="rtl" v-model="form.nameAr" placeholder="الأسنان" />
      </FormField>
    </div>

    <FormField :label="`${t('description')} (EN)`">
      <textarea class="ta" v-model="form.descEn" placeholder="Oral health and dental treatment…" />
    </FormField>
    <FormField :label="`${t('description')} (ع)`">
      <textarea class="ta" dir="rtl" v-model="form.descAr" placeholder="صحة الفم وعلاج الأسنان…" />
    </FormField>

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
            border: '1px solid ' + (form.icon === ic ? form.color : 'var(--border)'),
            background: form.icon === ic ? form.color + '1F' : 'var(--surface)',
            color: form.icon === ic ? form.color : 'var(--text-3)',
            boxShadow: form.icon === ic ? '0 0 0 3px ' + form.color + '26' : 'none',
            transition: 'all .14s',
          }"
          @click="form.icon = ic"
        >
          <AppIcon :name="ic" :size="20" />
        </button>
      </div>
    </FormField>

    <div class="field-row">
      <FormField :label="t('color')">
        <div class="chip-row">
          <button
            v-for="c in SPEC_COLORS"
            :key="c"
            type="button"
            :style="{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: c,
              border: '2px solid var(--surface)',
              boxShadow: form.color === c ? '0 0 0 2px ' + c : '0 0 0 1px var(--border)',
              transition: 'all .14s',
            }"
            @click="form.color = c"
          />
        </div>
      </FormField>
      <FormField :label="t('baseFee')" :error="errors.baseFee">
        <div class="inp-prefix">
          <span class="pfx">{{ feePrefix }}</span>
          <input class="inp num" type="number" v-model="form.baseFee" placeholder="500" />
        </div>
      </FormField>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" @click="submit">
        {{ isNew ? t('addSpecialization') : t('saveChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
