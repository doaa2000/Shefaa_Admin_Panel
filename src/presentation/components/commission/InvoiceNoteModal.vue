<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import FormField from '@/presentation/components/ui/FormField.vue';
import { useI18n } from '@/presentation/composables/useI18n';

/**
 * One short line of text against an invoice: how it was settled, or why it was
 * withdrawn. Two uses, one component, because the only difference between them
 * is the wording and whether the line is required.
 */
const props = withDefaults(
  defineProps<{
    title: string;
    label: string;
    hint?: string;
    placeholder?: string;
    /** A void with no reason is a row that raises the question it was meant to
     *  answer, so that one insists. */
    required?: boolean;
    danger?: boolean;
  }>(),
  { required: false, danger: false },
);

const emit = defineEmits<{ close: []; submit: [text: string] }>();

const { t } = useI18n();
const text = ref('');
const error = ref<string | null>(null);

function submit(): void {
  const value = text.value.trim();
  if (props.required && !value) {
    error.value = t.value('invoiceReasonRequired');
    return;
  }
  emit('submit', value);
}
</script>

<template>
  <BaseModal :title="title" @close="emit('close')">
    <FormField :label="label" :hint="hint" :error="error ?? undefined">
      <input class="inp" v-model="text" :placeholder="placeholder" @input="error = null" />
    </FormField>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton :variant="danger ? 'danger-soft' : 'primary'" @click="submit">
        {{ t('confirm') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
