<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import SearchBox from '@/presentation/components/ui/SearchBox.vue';
import SpecGlyph from '@/presentation/components/ui/SpecGlyph.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import SpecializationFormModal from '@/presentation/components/specializations/SpecializationFormModal.vue';
import { useSpecializations } from '@/presentation/composables/useSpecializations';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { formatMoney, formatNumber } from '@/shared/utils/format';
import type { Specialization, SpecializationInput } from '@/domain/entities/Specialization';

const { t, locale, pick } = useI18n();
const { toast } = useToast();
const specs = useSpecializations();

const editing = ref<Specialization | null>(null);
const showForm = ref(false);
const confirmTarget = ref<Specialization | null>(null);

onMounted(() => specs.load());

function openCreate(): void {
  editing.value = null;
  showForm.value = true;
}
function openEdit(s: Specialization): void {
  editing.value = s;
  showForm.value = true;
}

async function onSaved(input: SpecializationInput, isNew: boolean): Promise<void> {
  await specs.save(input);
  showForm.value = false;
  toast(isNew ? t.value('specializationAdded') : t.value('specializationUpdated'));
}

async function onConfirmDelete(): Promise<void> {
  if (!confirmTarget.value) return;
  await specs.remove(confirmTarget.value.id);
  confirmTarget.value = null;
  toast(t.value('specializationDeleted'));
}
</script>

<template>
  <div>
    <div class="toolbar">
      <SearchBox v-model="specs.search.value" :placeholder="t('search')" />
      <div class="spacer" />
      <span class="muted" style="font-size: 13px; font-weight: 500">
        {{ formatNumber(specs.filtered.value.length, locale) }} {{ t('results') }}
      </span>
      <BaseButton variant="primary" @click="openCreate">
        <AppIcon name="plus" :size="18" />{{ t('addSpecialization') }}
      </BaseButton>
    </div>

    <div class="card">
      <LoadingState v-if="specs.loading.value && !specs.items.value.length" />
      <ErrorState v-else-if="specs.error.value" :message="specs.error.value" @retry="specs.load()" />
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{ t('specialization') }}</th>
              <th>{{ t('description') }}</th>
              <th style="text-align: center">{{ t('doctorsAssigned') }}</th>
              <th style="text-align: end">{{ t('baseFee') }}</th>
              <th style="text-align: end">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in specs.filtered.value" :key="s.id">
              <td>
                <div class="cell-main">
                  <SpecGlyph :icon="s.icon" :color="s.color" />
                  <span class="cell-name">{{ pick(s.nameEn, s.nameAr) }}</span>
                </div>
              </td>
              <td class="txt-2" style="max-width: 420px">{{ pick(s.descEn, s.descAr) }}</td>
              <td style="text-align: center">
                <span class="badge info">{{ formatNumber(specs.doctorCount(s.id), locale) }}</span>
              </td>
              <td class="num fw6" style="text-align: end">{{ formatMoney(s.baseFee, locale) }}</td>
              <td>
                <div class="row-actions">
                  <ActionButton icon="edit" :title="t('edit')" @click="openEdit(s)" />
                  <ActionButton icon="trash" tone="danger" :title="t('delete')" @click="confirmTarget = s" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!specs.filtered.value.length" icon="stethoscope" />
      </div>
    </div>

    <SpecializationFormModal
      v-if="showForm"
      :spec="editing"
      @close="showForm = false"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-if="confirmTarget"
      :title="t('deleteConfirm')"
      :message="`${pick(confirmTarget.nameEn, confirmTarget.nameAr)} — ${t('deleteMsg')}`"
      @cancel="confirmTarget = null"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
