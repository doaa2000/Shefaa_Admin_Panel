<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import { useCampaigns } from '@/presentation/composables/useCampaigns';
import { useI18n } from '@/presentation/composables/useI18n';
import { formatNumber } from '@/shared/utils/format';
import type { Campaign, CampaignDelivery } from '@/domain/entities/Campaign';

/**
 * How far an announced convoy's notification actually got.
 *
 * "Announced to 300" is what the database wrote; how many phones buzzed is a
 * different number, and the gap is mostly people with no phone registered for
 * notifications. The admin can do something about those -- ring them, or ask
 * the clinic to -- but only if the page says who they are.
 */
const props = defineProps<{ campaign: Campaign }>();

const { t, locale } = useI18n();
const campaigns = useCampaigns();

/** Undefined until the first answer; null when the database cannot say. */
const delivery = ref<CampaignDelivery | null | undefined>(undefined);
const loading = ref(false);
const error = ref<string | null>(null);
const open = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    delivery.value = await campaigns.delivery(props.campaign.id);
  } catch (e) {
    error.value = (e as Error).message || 'Error';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
// Another announcement adds people to the count; read it again rather than
// show the figure from before the button was pressed.
watch(
  () => [props.campaign.round, props.campaign.announcedAt],
  () => load(),
);

const n = (v: number) => formatNumber(v, locale.value);

const headline = computed(() => {
  const d = delivery.value;
  if (!d) return '';
  return t.value('campaignDeliveryReached')
    .replace('{delivered}', n(d.delivered))
    .replace('{told}', n(d.told));
});

/** The server lists 200 at most. Said, so a short list is not read as the
 *  whole of it. */
const truncated = computed(() => {
  const d = delivery.value;
  return !!d && d.missed.length < d.noDevice + d.failed;
});
</script>

<template>
  <div v-if="delivery !== null" class="delivery">
    <div class="delivery-head">
      <AppIcon name="bell" :size="15" class="muted" />
      <span v-if="error" class="delivery-error">{{ t('campaignDeliveryError') }}</span>
      <span v-else-if="delivery === undefined" class="muted">{{ t('loading') }}</span>
      <span v-else-if="delivery.told === 0" class="muted">{{ t('campaignDeliveryNobody') }}</span>
      <template v-else>
        <strong>{{ headline }}</strong>
        <span v-if="delivery.noDevice" class="badge warn">
          {{ n(delivery.noDevice) }} {{ t('campaignDeliveryNoDevice') }}
        </span>
        <span v-if="delivery.failed" class="badge danger">
          {{ n(delivery.failed) }} {{ t('campaignDeliveryFailed') }}
        </span>
        <!-- Not a fault: the sender runs once a minute, and a convoy announced
             seconds ago is mostly this. -->
        <span v-if="delivery.pending" class="badge info" :title="t('campaignDeliveryPendingHint')">
          {{ n(delivery.pending) }} {{ t('campaignDeliveryPending') }}
        </span>
      </template>
      <div class="spacer" />
      <ActionButton
        icon="refresh"
        :title="t('campaignDeliveryRefresh')"
        :disabled="loading"
        @click="load"
      />
    </div>

    <template v-if="delivery && delivery.missed.length">
      <button type="button" class="delivery-toggle" @click="open = !open">
        <AppIcon :name="open ? 'chevD' : 'chevR'" :size="14" class="mirror" />
        {{ t('campaignDeliveryMissed') }} ({{ n(delivery.noDevice + delivery.failed) }})
      </button>
      <ul v-if="open" class="delivery-list">
        <li v-for="m in delivery.missed" :key="m.userId">
          <span class="fw6">{{ m.name || t('campaignDeliveryNoName') }}</span>
          <span v-if="m.phone" class="num muted" dir="ltr">{{ m.phone }}</span>
          <div class="spacer" />
          <span class="delivery-reason" :class="m.reason">
            {{ t(m.reason === 'failed' ? 'campaignDeliveryReasonFailed' : 'campaignDeliveryReasonNoDevice') }}
          </span>
        </li>
        <li v-if="truncated" class="muted">{{ t('campaignDeliveryTruncated') }}</li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.delivery {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  font-size: 13px;
}
.delivery-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.delivery-error {
  color: var(--danger);
}
.delivery-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-deep);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.delivery-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 2px;
  max-height: 260px;
  overflow-y: auto;
}
.delivery-list li {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 6px 8px;
  border-radius: var(--r-xs);
  background: var(--surface-2);
}
.delivery-reason {
  font-size: 12px;
  color: var(--warn);
}
.delivery-reason.failed {
  color: var(--danger);
}
</style>
