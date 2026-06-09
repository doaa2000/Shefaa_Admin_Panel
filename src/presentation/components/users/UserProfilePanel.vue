<script setup lang="ts">
import SidePanel from '@/presentation/components/ui/SidePanel.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import StatusBadge from '@/presentation/components/ui/StatusBadge.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import type { Patient } from '@/domain/entities/Patient';
import type { Appointment } from '@/domain/entities/Appointment';
import { PatientStatus } from '@/domain/enums';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatNumber, formatDate } from '@/shared/utils/format';

const props = defineProps<{ patient: Patient; appointments: Appointment[] }>();
const emit = defineEmits<{ close: []; toggle: [] }>();
const { t, locale, pick } = useI18n();
void props;
</script>

<template>
  <SidePanel @close="emit('close')">
    <template #head>
      <div style="display: flex; align-items: center; gap: 14px">
        <AppAvatar :name="pick(patient.nameEn, patient.nameAr)" :color="patient.color" :size="52" />
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 700">{{ pick(patient.nameEn, patient.nameAr) }}</h2>
          <div style="margin-top: 4px"><StatusBadge :status="patient.status" /></div>
        </div>
      </div>
    </template>

    <div class="fw6" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin-bottom: 12px">
      {{ t('contact') }}
    </div>
    <div style="display: grid; gap: 12px; margin-bottom: 22px">
      <div style="display: flex; align-items: center; gap: 12px">
        <div class="tree-ico" style="background: var(--accent-soft); color: var(--accent-deep); width: 38px; height: 38px">
          <AppIcon name="phone" :size="17" />
        </div>
        <div class="num" dir="ltr">{{ patient.phone }}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px">
        <div class="tree-ico" style="background: var(--purple-soft); color: var(--purple); width: 38px; height: 38px">
          <AppIcon name="mail" :size="17" />
        </div>
        <div>{{ patient.email }}</div>
      </div>
    </div>

    <div class="fw6" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin-bottom: 12px">
      {{ t('activitySummary') }}
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px">
      <div class="card card-pad" style="box-shadow: none; background: var(--surface-2)">
        <div class="stat-val" style="font-size: 26px; color: var(--accent-deep)">
          {{ formatNumber(patient.totalBookings, locale) }}
        </div>
        <div class="stat-label" style="margin-top: 4px">{{ t('appointmentsCount') }}</div>
      </div>
      <div class="card card-pad" style="box-shadow: none; background: var(--surface-2)">
        <div class="stat-val" style="font-size: 18px; margin-top: 4px">{{ patient.joined }}</div>
        <div class="stat-label" style="margin-top: 4px">{{ t('memberSince') }}</div>
      </div>
    </div>

    <div class="fw6" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin-bottom: 8px">
      {{ t('recent_bookings') }}
    </div>
    <div class="recent">
      <div v-if="!appointments.length" class="muted" style="font-size: 13.5px; padding: 8px 0">—</div>
      <div v-for="a in appointments" :key="a.id" class="recent-row">
        <AppAvatar :name="pick(a.doctorEn, a.doctorAr)" :color="a.doctorColor" :size="36" />
        <div style="flex: 1">
          <div class="fw6" style="font-size: 13.5px">{{ pick(a.doctorEn, a.doctorAr) }}</div>
          <div class="cell-sub">
            {{ pick(a.specializationEn, a.specializationAr) }} · {{ formatDate(a.datetime, locale) }}
          </div>
        </div>
        <StatusBadge :status="a.status" />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="ghost" block @click="emit('close')">{{ t('cancel') }}</BaseButton>
      <BaseButton
        block
        :variant="patient.status === PatientStatus.Blocked ? 'primary' : 'danger-soft'"
        @click="emit('toggle')"
      >
        <AppIcon name="power" :size="17" />
        {{ patient.status === PatientStatus.Blocked ? t('unblock') : t('block') }}
      </BaseButton>
    </template>
  </SidePanel>
</template>
