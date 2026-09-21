<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import DoctorCredentialsModal from '@/presentation/components/doctors/DoctorCredentialsModal.vue';
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

/** Which row is waiting on the function, so its button cannot be pressed twice. */
const issuingFor = ref<string | null>(null);

/** Shown once, then gone. Never fetched again — the password is not stored. */
const credentials = ref<{ doctorName: string; email: string; password: string } | null>(null);

/**
 * Each refusal the function can give, in the words of what to do about it.
 *
 * A code like `email_already_in_use` is exact and useless to the person
 * reading it; what they need is which of the two situations it is and where to
 * go next.
 */
const ACCOUNT_ERRORS: Record<string, string> = {
  demo_backend: 'err_demo_backend',
  not_an_admin: 'err_not_an_admin',
  not_signed_in: 'err_not_signed_in',
  doctor_has_no_email: 'err_no_email',
  already_has_account: 'err_already_has_account',
  email_already_in_use: 'err_email_in_use',
  no_account_yet: 'err_no_account_yet',
  doctor_not_found: 'err_doctor_not_found',
};

async function onIssueAccount(d: Doctor): Promise<void> {
  if (issuingFor.value) return;
  issuingFor.value = String(d.id);
  try {
    const made = await doctors.issueAccount(d, d.hasAccount ? 'reset' : 'create');
    credentials.value = {
      doctorName: pick(d.nameEn, d.nameAr),
      email: made.email || d.email,
      password: made.password,
    };
  } catch (e) {
    const key = ACCOUNT_ERRORS[(e as Error).message];
    toast(key ? t.value(key) : (e as Error).message, 'danger');
  } finally {
    issuingFor.value = null;
  }
}

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
  try {
    await doctors.save(input);
    showForm.value = false;
    toast(isNew ? t.value('doctorAdded') : t.value('doctorUpdated'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onToggle(d: Doctor): Promise<void> {
  try {
    await doctors.toggleStatus(d);
    toast(d.status === DoctorStatus.Active ? t.value('deactivate') : t.value('activate'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onConfirmDelete(): Promise<void> {
  if (!confirmTarget.value) return;
  try {
    await doctors.remove(confirmTarget.value.id);
    confirmTarget.value = null;
    toast(t.value('doctorDeleted'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
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
                  <!-- A clinic without a login is registered but cannot be
                       opened by the person it belongs to, so this sits first
                       and calls itself what it does. Once there is one, the
                       same place offers the only other thing left: a new
                       password, since the old one cannot be read back. -->
                  <ActionButton
                    :icon="d.hasAccount ? 'key' : 'user'"
                    :tone="d.hasAccount ? 'default' : 'ok'"
                    :disabled="issuingFor === d.id"
                    :title="d.hasAccount ? t('reset_password') : t('create_login')"
                    @click="onIssueAccount(d)"
                  />
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

    <DoctorCredentialsModal
      v-if="credentials"
      :doctor-name="credentials.doctorName"
      :email="credentials.email"
      :password="credentials.password"
      @close="credentials = null"
    />
</template>
