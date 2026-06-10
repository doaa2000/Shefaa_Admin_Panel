<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import SearchBox from '@/presentation/components/ui/SearchBox.vue';
import FilterSelect from '@/presentation/components/ui/FilterSelect.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import UserProfilePanel from '@/presentation/components/users/UserProfilePanel.vue';
import { usePatients } from '@/presentation/composables/usePatients';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { PatientStatus } from '@/domain/enums';
import { formatNumber } from '@/shared/utils/format';
import type { Patient } from '@/domain/entities/Patient';
import type { SelectOption } from '@/presentation/components/ui/types';

const { t, locale, pick } = useI18n();
const { toast } = useToast();
const patients = usePatients();

const profile = ref<Patient | null>(null);
const confirmTarget = ref<Patient | null>(null);

onMounted(() => patients.load());

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: `${t.value('all')} — ${t.value('status')}` },
  { value: 'active', label: t.value('active') },
  { value: 'blocked', label: t.value('blocked') },
]);

async function onConfirm(): Promise<void> {
  if (!confirmTarget.value) return;
  const wasBlocked = confirmTarget.value.status === PatientStatus.Blocked;
  try {
    await patients.toggleBlocked(confirmTarget.value);
    toast(wasBlocked ? t.value('userUnblocked') : t.value('userBlocked'));
    confirmTarget.value = null;
    profile.value = null;
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <SearchBox v-model="patients.search.value" :placeholder="t('search')" />
      <FilterSelect v-model="patients.statusFilter.value" :options="statusOptions" />
      <div class="spacer" />
      <span class="muted" style="font-size: 13px; font-weight: 500">
        {{ formatNumber(patients.filtered.value.length, locale) }} {{ t('results') }}
      </span>
    </div>

    <div class="card">
      <LoadingState v-if="patients.loading.value && !patients.items.value.length" />
      <ErrorState v-else-if="patients.error.value" :message="patients.error.value" @retry="patients.load()" />
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{ t('patient') }}</th>
              <th>{{ t('phone') }}</th>
              <th>{{ t('email') }}</th>
              <th style="text-align: center">{{ t('totalBookings') }}</th>
              <th>{{ t('joined') }}</th>
              <th>{{ t('status') }}</th>
              <th style="text-align: end">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in patients.filtered.value" :key="p.id">
              <td>
                <div class="cell-main">
                  <AppAvatar :name="pick(p.nameEn, p.nameAr)" :color="p.color" :size="38" />
                  <span class="cell-name">{{ pick(p.nameEn, p.nameAr) }}</span>
                </div>
              </td>
              <td class="num txt-2" dir="ltr" :style="{ textAlign: locale === 'ar' ? 'right' : 'left' }">
                {{ p.phone }}
              </td>
              <td class="txt-2">{{ p.email }}</td>
              <td style="text-align: center">
                <span class="badge info">{{ formatNumber(p.totalBookings, locale) }}</span>
              </td>
              <td class="txt-2">{{ p.joined }}</td>
              <td><StatusBadge :status="p.status" /></td>
              <td>
                <div class="row-actions">
                  <ActionButton icon="eye" :title="t('viewProfile')" @click="profile = p" />
                  <ActionButton
                    icon="power"
                    :tone="p.status === PatientStatus.Blocked ? 'ok' : 'danger'"
                    :title="p.status === PatientStatus.Blocked ? t('unblock') : t('block')"
                    @click="confirmTarget = p"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!patients.filtered.value.length" icon="users" />
      </div>
    </div>

    <UserProfilePanel
      v-if="profile"
      :patient="profile"
      :appointments="patients.appointmentsOf(profile)"
      @close="profile = null"
      @toggle="confirmTarget = profile"
    />

    <ConfirmDialog
      v-if="confirmTarget"
      :danger="confirmTarget.status !== PatientStatus.Blocked"
      :title="confirmTarget.status === PatientStatus.Blocked ? `${t('unblock')}؟` : `${t('block')}؟`"
      :message="pick(confirmTarget.nameEn, confirmTarget.nameAr)"
      :confirm-label="confirmTarget.status === PatientStatus.Blocked ? t('unblock') : t('block')"
      @cancel="confirmTarget = null"
      @confirm="onConfirm"
    />
  </div>
</template>
