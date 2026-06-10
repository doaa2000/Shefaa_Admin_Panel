<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ActionButton from '@/presentation/components/ui/ActionButton.vue';
import LoadingState from '@/presentation/components/ui/LoadingState.vue';
import ErrorState from '@/presentation/components/ui/ErrorState.vue';
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue';
import LocationFormModal from '@/presentation/components/locations/LocationFormModal.vue';
import { useLocations } from '@/presentation/composables/useLocations';
import { useI18n } from '@/presentation/composables/useI18n';
import { useToast } from '@/presentation/composables/useToast';
import { LocationLevel } from '@/domain/enums';
import type { LocationChain } from '@/domain/entities/Location';
import { formatNumber } from '@/shared/utils/format';

const { t, locale, pick } = useI18n();
const { toast } = useToast();
const loc = useLocations();

onMounted(() => loc.load());

interface AddState {
  level: LocationLevel;
  chain: LocationChain;
  parentName?: string;
}
interface ConfirmState {
  level: LocationLevel;
  ids: LocationChain;
  name: string;
}

const adding = ref<AddState | null>(null);
const confirmState = ref<ConfirmState | null>(null);

async function onAdd(nameEn: string, nameAr: string): Promise<void> {
  if (!adding.value) return;
  const { level, chain } = adding.value;
  try {
    await loc.addNode(level, nameEn, nameAr, chain);
    if (level === LocationLevel.City && chain.gov) loc.ensureOpen(chain.gov);
    if (level === LocationLevel.Clinic && chain.gov && chain.city) loc.ensureOpen(chain.gov, chain.city);
    adding.value = null;
    toast(t.value('locAdded'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}

async function onDelete(): Promise<void> {
  if (!confirmState.value) return;
  try {
    await loc.deleteNode(confirmState.value.level, confirmState.value.ids);
    confirmState.value = null;
    toast(t.value('locDeleted'));
  } catch (e) {
    toast((e as Error).message || 'Error', 'danger');
  }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <BaseButton variant="ghost" small @click="loc.expandAll()">
        <AppIcon name="chevD" :size="16" />{{ t('expandAll') }}
      </BaseButton>
      <BaseButton variant="ghost" small @click="loc.collapseAll()">
        <AppIcon name="chevR" :size="16" />{{ t('collapseAll') }}
      </BaseButton>
      <div class="spacer" />
      <BaseButton variant="primary" @click="adding = { level: LocationLevel.Governorate, chain: {} }">
        <AppIcon name="plus" :size="18" />{{ t('addGov') }}
      </BaseButton>
    </div>

    <LoadingState v-if="loc.loading.value && !loc.tree.value.length" />
    <ErrorState v-else-if="loc.error.value" :message="loc.error.value" @retry="loc.load()" />

    <div v-else class="tree">
      <div v-for="g in loc.tree.value" :key="g.id" class="tree-node tree-gov">
        <div class="tree-row" @click="loc.toggle(g.id)">
          <div class="tree-caret" :class="{ open: loc.isOpen(g.id) }"><AppIcon name="chevR" :size="16" /></div>
          <div class="tree-ico" style="background: var(--accent-soft); color: var(--accent-deep)">
            <AppIcon name="pin" :size="18" />
          </div>
          <div>
            <div class="tree-name">{{ pick(g.nameEn, g.nameAr) }}</div>
            <div class="tree-meta">
              {{ formatNumber(loc.govStats(g.id).cities, locale) }} {{ t('cities') }} ·
              {{ formatNumber(loc.govStats(g.id).clinics, locale) }} {{ t('clinics') }}
            </div>
          </div>
          <div class="tree-actions" @click.stop>
            <ActionButton
              icon="plus"
              :size="15"
              :title="t('addCity')"
              @click="adding = { level: LocationLevel.City, chain: { gov: g.id }, parentName: pick(g.nameEn, g.nameAr) }"
            />
            <ActionButton
              icon="trash"
              tone="danger"
              :size="15"
              :title="t('delete')"
              @click="confirmState = { level: LocationLevel.Governorate, ids: { gov: g.id }, name: pick(g.nameEn, g.nameAr) }"
            />
          </div>
        </div>

        <div v-if="loc.isOpen(g.id)" class="tree-children">
          <div v-if="!g.cities.length" class="muted" style="font-size: 13px; padding: 4px 2px">—</div>
          <div v-for="c in g.cities" :key="c.id" class="tree-node">
            <div class="tree-row" @click="loc.toggle(c.id)">
              <div class="tree-caret" :class="{ open: loc.isOpen(c.id) }"><AppIcon name="chevR" :size="16" /></div>
              <div class="tree-ico" style="background: var(--purple-soft); color: var(--purple)">
                <AppIcon name="city" :size="18" />
              </div>
              <div>
                <div class="tree-name">{{ pick(c.nameEn, c.nameAr) }}</div>
                <div class="tree-meta">{{ formatNumber(c.clinics.length, locale) }} {{ t('clinics') }}</div>
              </div>
              <div class="tree-actions" @click.stop>
                <ActionButton
                  icon="plus"
                  :size="15"
                  :title="t('addClinic')"
                  @click="adding = { level: LocationLevel.Clinic, chain: { gov: g.id, city: c.id }, parentName: pick(c.nameEn, c.nameAr) }"
                />
                <ActionButton
                  icon="trash"
                  tone="danger"
                  :size="15"
                  :title="t('delete')"
                  @click="confirmState = { level: LocationLevel.City, ids: { gov: g.id, city: c.id }, name: pick(c.nameEn, c.nameAr) }"
                />
              </div>
            </div>

            <div v-if="loc.isOpen(c.id)" class="tree-children">
              <div v-if="!c.clinics.length" class="muted" style="font-size: 13px; padding: 4px 2px">—</div>
              <div
                v-for="cl in c.clinics"
                :key="cl.id"
                class="tree-row"
                style="border: 1px solid var(--border); border-radius: var(--r-sm); cursor: default"
              >
                <div class="tree-ico" style="background: var(--ok-soft); color: var(--ok); width: 32px; height: 32px">
                  <AppIcon name="building" :size="16" />
                </div>
                <div style="flex: 1">
                  <div class="tree-name" style="font-size: 14px">{{ pick(cl.nameEn, cl.nameAr) }}</div>
                  <div class="tree-meta">
                    {{ formatNumber(loc.doctorsInClinic(cl.id).length, locale) }} {{ t('doctors_l') }}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px">
                  <div style="display: flex">
                    <div
                      v-for="(d, i) in loc.doctorsInClinic(cl.id).slice(0, 4)"
                      :key="d.id"
                      :style="{ marginInlineStart: i ? '-10px' : '0', border: '2px solid var(--surface)', borderRadius: '50%' }"
                    >
                      <AppAvatar :name="pick(d.nameEn, d.nameAr)" :color="d.color" :size="28" />
                    </div>
                    <div
                      v-if="loc.doctorsInClinic(cl.id).length > 4"
                      style="margin-inline-start: -10px; width: 28px; height: 28px; border-radius: 50%; background: var(--surface-2); border: 2px solid var(--surface); display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--text-3)"
                    >
                      +{{ loc.doctorsInClinic(cl.id).length - 4 }}
                    </div>
                  </div>
                  <div class="tree-actions" style="opacity: 1">
                    <ActionButton
                      icon="trash"
                      tone="danger"
                      :size="15"
                      :title="t('delete')"
                      @click="confirmState = { level: LocationLevel.Clinic, ids: { gov: g.id, city: c.id, clinic: cl.id }, name: pick(cl.nameEn, cl.nameAr) }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LocationFormModal
      v-if="adding"
      :level="adding.level"
      :parent-name="adding.parentName"
      @close="adding = null"
      @submit="onAdd"
    />

    <ConfirmDialog
      v-if="confirmState"
      :title="t('deleteConfirm')"
      :message="`${confirmState.name} — ${t('deleteMsg')}`"
      @cancel="confirmState = null"
      @confirm="onDelete"
    />
  </div>
</template>
