<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import EmptyState from '@/presentation/components/ui/EmptyState.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import CampaignFormModal from '@/presentation/components/campaigns/CampaignFormModal.vue';
import { useCampaigns } from '@/presentation/composables/useCampaigns';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { formatNumber } from '@/shared/utils/format';
import type { Campaign, CampaignInput } from '@/domain/entities/Campaign';

const { t, locale } = useI18n();
const { toast } = useToast();
const campaigns = useCampaigns();

const editing = ref<Campaign | null>(null);
const showForm = ref(false);
const confirmTarget = ref<Campaign | null>(null);
/**
 * Announcing is confirmed, where saving is not.
 *
 * It is the one button on this page that cannot be undone: a push notification
 * is read on a lock screen seconds later, and there is no taking it back from
 * a governorate.
 */
const announceTarget = ref<Campaign | null>(null);

onMounted(() => campaigns.load());

function openCreate(): void {
  editing.value = null;
  showForm.value = true;
}
function openEdit(c: Campaign): void {
  editing.value = c;
  showForm.value = true;
}

async function onSaved(input: CampaignInput, isNew: boolean): Promise<void> {
  try {
    await campaigns.save(input);
    showForm.value = false;
    toast(isNew ? t.value('campaignAdded') : t.value('campaignUpdated'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onConfirmAnnounce(): Promise<void> {
  const target = announceTarget.value;
  if (!target) return;
  announceTarget.value = null;
  try {
    const result = await campaigns.announce(target.id);
    // Three outcomes, and the admin is told which. "Sent" when nobody was sent
    // anything is how a page teaches somebody to trust a button that lies.
    if (result.addressed > 0) {
      toast(
        `${t.value('campaignAnnounced_toast')} — ${formatNumber(result.addressed, locale.value)} ${t.value('campaignAddressed')}`,
      );
    } else {
      toast(t.value('campaignNobodyNew'), 'info');
    }
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onConfirmDelete(): Promise<void> {
  if (!confirmTarget.value) return;
  try {
    await campaigns.remove(confirmTarget.value.id);
    confirmTarget.value = null;
    toast(t.value('campaignDeleted'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

function statusTone(status: Campaign['status']): string {
  if (status === 'announced') return 'success';
  if (status === 'postponed') return 'warn';
  if (status === 'cancelled') return 'danger';
  return 'info';
}

function statusLabel(status: Campaign['status']): string {
  return t.value(
    status === 'announced'
      ? 'campaignAnnounced'
      : status === 'postponed'
        ? 'campaignPostponed'
        : status === 'cancelled'
          ? 'campaignCancelled'
          : 'campaignDraft',
  );
}

/** `12 - 14` for a range, one date for a single day. */
function dates(c: Campaign): string {
  return c.startsOn === c.endsOn ? c.startsOn : `${c.startsOn} — ${c.endsOn}`;
}

function hours(c: Campaign): string {
  if (!c.startTime) return '';
  return c.endTime ? `${c.startTime} — ${c.endTime}` : c.startTime;
}
</script>

<template>
  <div>
    <div class="toolbar">
      <span class="muted" style="font-size: 13px; font-weight: 500">
        {{ formatNumber(campaigns.live.value.length, locale) }} {{ t('campaignLiveCount') }}
      </span>
      <!-- Counted separately because it is the list most likely to have been
           forgotten: written, never sent, invisible to every patient. -->
      <span
        v-if="campaigns.drafts.value.length"
        class="badge info"
        style="font-size: 12px"
      >
        {{ formatNumber(campaigns.drafts.value.length, locale) }} {{ t('campaignDraftCount') }}
      </span>
      <div class="spacer" />
      <BaseButton variant="primary" @click="openCreate">
        <AppIcon name="plus" :size="18" />{{ t('addCampaign') }}
      </BaseButton>
    </div>

    <div class="card">
      <LoadingState v-if="campaigns.loading.value && !campaigns.items.value.length" />
      <ErrorState
        v-else-if="campaigns.error.value"
        :message="campaigns.error.value"
        @retry="campaigns.load()"
      />
      <div v-else class="campaign-list">
        <article
          v-for="c in campaigns.items.value"
          :key="c.id"
          class="campaign-card"
          :class="{ over: c.endsOn < campaigns.today() }"
        >
          <div class="campaign-head">
            <span class="badge" :class="statusTone(c.status)">{{ statusLabel(c.status) }}</span>
            <strong>{{ c.title }}</strong>
            <div class="spacer" />
            <span v-if="c.endsOn < campaigns.today()" class="muted" style="font-size: 12px">
              {{ t('campaignFinished') }}
            </span>
          </div>

          <dl class="campaign-facts">
            <div>
              <dt>{{ t('campaignDates') }}</dt>
              <dd>{{ dates(c) }}</dd>
            </div>
            <div v-if="hours(c)">
              <dt>{{ t('campaignHours') }}</dt>
              <dd>{{ hours(c) }}</dd>
            </div>
            <div>
              <dt>{{ t('campaignAudience') }}</dt>
              <!-- The one fact worth saying in words. A blank governorate means
                   every account there is, and nothing else on the card says so. -->
              <dd>{{ campaigns.placeOf(c) || t('campaignNationwide') }}</dd>
            </div>
            <div>
              <dt>{{ t('campaignTold') }}</dt>
              <dd>
                {{
                  c.round === 0
                    ? t('campaignNotToldYet')
                    : `${formatNumber(c.round, locale)} ${t('campaignTimes')}`
                }}
              </dd>
            </div>
          </dl>

          <div class="campaign-bar">
            <BaseButton
              variant="soft"
              :disabled="!campaigns.canAnnounce(c) || campaigns.announcing.value === c.id"
              :title="campaigns.canAnnounce(c) ? undefined : t('campaignCannotAnnounce')"
              @click="announceTarget = c"
            >
              <AppIcon name="bell" :size="16" />
              {{ campaigns.announcing.value === c.id ? t('campaignSending') : t('campaignAnnounce') }}
            </BaseButton>
            <div class="spacer" />
            <div class="row-actions">
              <ActionButton icon="edit" :title="t('edit')" @click="openEdit(c)" />
              <ActionButton
                icon="trash"
                tone="danger"
                :title="t('delete')"
                @click="confirmTarget = c"
              />
            </div>
          </div>
        </article>

        <EmptyState v-if="!campaigns.items.value.length" icon="bell" />
      </div>
    </div>

    <CampaignFormModal
      v-if="showForm"
      :campaign="editing"
      @close="showForm = false"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-if="announceTarget"
      :title="t('campaignAnnounceConfirm')"
      :message="`${announceTarget.title} — ${campaigns.placeOf(announceTarget) || t('campaignNationwide')}. ${t('campaignAnnounceWarning')}`"
      @cancel="announceTarget = null"
      @confirm="onConfirmAnnounce"
    />

    <ConfirmDialog
      v-if="confirmTarget"
      :title="t('deleteConfirm')"
      :message="`${confirmTarget.title} — ${t('deleteMsg')}`"
      @cancel="confirmTarget = null"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<style scoped>
.campaign-list {
  display: grid;
  gap: 14px;
  padding: 16px;
}
.campaign-card {
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  overflow: hidden;
}
/* A finished convoy stays listed -- last month's are looked up here -- but
   reads as past rather than current. */
.campaign-card.over {
  opacity: 0.66;
}
.campaign-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}
.campaign-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 12px 14px;
}
.campaign-facts dt {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 2px;
}
.campaign-facts dd {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
}
.campaign-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}
</style>
