<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import SearchBox from '@/presentation/components/ui/SearchBox.vue';
import FilterSelect from '@/presentation/components/ui/FilterSelect.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import DoctorFormModal from '@/presentation/components/doctors/DoctorFormModal.vue';
import { useDoctors } from '@/presentation/composables/useDoctors';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { DoctorStatus } from '@/domain/enums';
import { formatMoney, formatNumber } from '@/shared/utils/format';
import type { Doctor } from '@/domain/entities/Doctor';
import type { DoctorInput } from '@/domain/entities/Doctor';
import type { SelectOption } from '@/presentation/components/ui/types';

const { t, locale, pick } = useI18n();
const { toast } = useToast();
const doctors = useDoctors();

const editing = ref<Doctor | null>(null);
const showForm = ref(false);
const confirmTarget = ref<Doctor | null>(null);

onMounted(() => doctors.load());

const specOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('specialization')}` },
  ...doctors.specializations.value.map((s) => ({
    value: s.id,
    label: locale.value === 'ar' ? s.nameAr : s.nameEn,
  })),
]);

function openCreate(): void {
  editing.value = null;
  showForm.value = true;
}
function openEdit(d: Doctor): void {
  editing.value = d;
  showForm.value = true;
}

async function onSaved(input: DoctorInput, isNew: boolean): Promise<void> {
  await doctors.save(input);
  showForm.value = false;
  toast(isNew ? t.value('doctorAdded') : t.value('doctorUpdated'));
}

async function onToggle(d: Doctor): Promise<void> {
  await doctors.toggleStatus(d);
  toast(d.status === DoctorStatus.Active ? t.value('deactivate') : t.value('activate'));
}

async function onConfirmDelete(): Promise<void> {
  if (!confirmTarget.value) return;
  await doctors.remove(confirmTarget.value.id);
  confirmTarget.value = null;
  toast(t.value('doctorDeleted'));
}
</script>

<template>
  <div>
    <div class="toolbar">
      <SearchBox v-model="doctors.search.value" :placeholder="t('search')" />
      <FilterSelect v-model="doctors.specializationFilter.value" :options="specOptions" />
      <div class="spacer" />
      <span class="muted" style="font-size: 13px; font-weight: 500">
        {{ formatNumber(doctors.filtered.value.length, locale) }} {{ t('results') }}
      </span>
      <BaseButton variant="primary" @click="openCreate">
        <AppIcon name="plus" :size="18" />{{ t('addDoctor') }}
      </BaseButton>
    </div>

    <div class="card">
      <LoadingState v-if="doctors.loading.value && !doctors.items.value.length" />
      <ErrorState v-else-if="doctors.error.value" :message="doctors.error.value" @retry="doctors.load()" />
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{ t('doctor') }}</th>
              <th>{{ t('specialization') }}</th>
              <th>{{ t('clinic') }}</th>
              <th>{{ t('city') }}</th>
              <th style="text-align: end">{{ t('fee') }}</th>
              <th>{{ t('status') }}</th>
              <th style="text-align: end">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in doctors.filtered.value" :key="d.id">
              <td>
                <div class="cell-main">
                  <AppAvatar :name="pick(d.nameEn, d.nameAr)" :color="d.color" :size="40" />
                  <div>
                    <div class="cell-name">{{ pick(d.nameEn, d.nameAr) }}</div>
                    <div class="cell-sub">{{ d.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span
                  v-if="doctors.specializationOf(d)"
                  class="badge"
                  :style="{
                    color: doctors.specializationOf(d)!.color,
                    background: doctors.specializationOf(d)!.color + '1A',
                  }"
                >
                  <AppIcon :name="doctors.specializationOf(d)!.icon" :size="13" />
                  {{ pick(doctors.specializationOf(d)!.nameEn, doctors.specializationOf(d)!.nameAr) }}
                </span>
                <span v-else class="tag">{{ pick(d.specialtyEn, d.specialtyAr) }}</span>
              </td>
              <td class="txt-2">{{ pick(d.clinicEn, d.clinicAr) }}</td>
              <td class="txt-2">{{ pick(d.cityEn, d.cityAr) }}</td>
              <td class="num fw6" style="text-align: end">{{ formatMoney(d.fee, locale) }}</td>
              <td><StatusBadge :status="d.status" /></td>
              <td>
                <div class="row-actions">
                  <ActionButton
                    icon="power"
                    tone="ok"
                    :title="d.status === DoctorStatus.Active ? t('deactivate') : t('activate')"
                    @click="onToggle(d)"
                  />
                  <ActionButton icon="edit" :title="t('edit')" @click="openEdit(d)" />
                  <ActionButton icon="trash" tone="danger" :title="t('delete')" @click="confirmTarget = d" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!doctors.filtered.value.length" icon="doctors" />
      </div>
    </div>

    <DoctorFormModal
      v-if="showForm"
      :doctor="editing"
      :specializations="doctors.specializations.value"
      @close="showForm = false"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-if="confirmTarget"
      :title="t('deleteConfirm')"
      :message="t('deleteMsg')"
      @cancel="confirmTarget = null"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
