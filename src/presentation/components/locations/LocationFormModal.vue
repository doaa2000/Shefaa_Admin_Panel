<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import { LocationLevel } from '@/domain/enums';
import { useI18n } from '@/presentation/composables/useI18n';

const props = defineProps<{ level: LocationLevel; parentName?: string }>();
const emit = defineEmits<{ close: []; submit: [nameEn: string, nameAr: string] }>();

const { t } = useI18n();
const nameEn = ref('');
const nameAr = ref('');
const error = ref('');

const titles: Record<LocationLevel, string> = {
  [LocationLevel.Governorate]: t.value('addGov'),
  [LocationLevel.City]: t.value('addCity'),
  [LocationLevel.Clinic]: t.value('addClinic'),
};
const labels: Record<LocationLevel, string> = {
  [LocationLevel.Governorate]: t.value('govName'),
  [LocationLevel.City]: t.value('cityName'),
  [LocationLevel.Clinic]: t.value('clinicName'),
};

const title = computed(() => titles[props.level]);
const label = computed(() => labels[props.level]);

function submit(): void {
  if (!nameEn.value.trim()) {
    error.value = t.value('required');
    return;
  }
  emit('submit', nameEn.value, nameAr.value);
}
</script>

<template>
  <BaseModal :title="title" :subtitle="parentName" @close="emit('close')">
    <div class="field-row">
      <FormField :label="`${label} (EN)`" :error="error">
        <input class="inp" v-model="nameEn" autofocus />
      </FormField>
      <FormField :label="`${label} (ع)`">
        <input class="inp" dir="rtl" v-model="nameAr" />
      </FormField>
    </div>
    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton variant="primary" @click="submit">{{ t('add') }}</BaseButton>
    </template>
  </BaseModal>
</template>
