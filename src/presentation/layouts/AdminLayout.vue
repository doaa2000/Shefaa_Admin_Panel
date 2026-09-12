<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import AppAvatar from '@/presentation/components/ui/AppAvatar.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import ToastHost from '@/presentation/components/ui/ToastHost.vue';
import { useI18n } from '@/presentation/composables/useI18n';
import { useAuth } from '@/presentation/composables/useAuth';
import { useUiStore } from '@/presentation/stores/ui.store';
import { useDoctorsStore } from '@/presentation/stores/doctors.store';
import { useSpecializationsStore } from '@/presentation/stores/specializations.store';
import { useAppointmentsStore } from '@/presentation/stores/appointments.store';
import { usePatientsStore } from '@/presentation/stores/patients.store';
import { useBannersStore } from '@/presentation/stores/banners.store';
import { formatNumber } from '@/shared/utils/format';
import { isLocalBackend } from '@/shared/utils/backend';

const { t, locale, setLocale } = useI18n();
const { admin, signOut } = useAuth();
const ui = useUiStore();
const { mobileNavOpen } = storeToRefs(ui);
const route = useRoute();
const router = useRouter();

const doctors = useDoctorsStore();
const specs = useSpecializationsStore();
const appts = useAppointmentsStore();
const patients = usePatientsStore();
const banners = useBannersStore();

// Preload counts shown in the nav.
onMounted(() => {
  doctors.fetchAll();
  specs.fetchAll();
  appts.fetchAll();
  patients.fetchAll();
  banners.fetchAll();
});

const navGroups = computed(() => [
  {
    group: t.value('nav_main'),
    items: [{ id: 'dashboard', label: t.value('nav_dashboard'), icon: 'dashboard', count: null as number | null }],
  },
  {
    group: t.value('nav_manage'),
    items: [
      { id: 'doctors', label: t.value('nav_doctors'), icon: 'doctors', count: doctors.items.length },
      { id: 'specializations', label: t.value('nav_specializations'), icon: 'stethoscope', count: specs.items.length },
      { id: 'locations', label: t.value('nav_locations'), icon: 'locations', count: null },
      { id: 'appointments', label: t.value('nav_appointments'), icon: 'appointments', count: appts.items.length },
      { id: 'users', label: t.value('nav_users'), icon: 'users', count: patients.items.length },
      { id: 'banners', label: t.value('nav_banners'), icon: 'image', count: banners.items.length },
    ],
  },
]);

const currentId = computed(() => (route.name as string) ?? 'dashboard');
const pageTitle = computed(() => t.value('nav_' + currentId.value));
const pageSub = computed(() => t.value('sub_' + currentId.value));

function go(id: string): void {
  router.push({ name: id });
  ui.closeMobileNav();
}

// Read once: the provider is fixed for the life of the page.
const onLocalBackend = isLocalBackend();

const menuOpen = ref(false);
async function onLogout(): Promise<void> {
  menuOpen.value = false;
  await signOut();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="app">
    <aside class="sidebar" :class="{ open: mobileNavOpen }">
      <div class="brand">
        <div class="brand-logo"><AppIcon name="heart" :size="22" fill="#fff" /></div>
        <div>
          <div class="brand-name">{{ t('brand') }}</div>
          <div class="brand-sub">{{ t('brandSub') }}</div>
        </div>
      </div>

      <nav class="nav">
        <template v-for="(grp, gi) in navGroups" :key="gi">
          <div class="nav-label">{{ grp.group }}</div>
          <button
            v-for="it in grp.items"
            :key="it.id"
            class="nav-item"
            :class="{ active: currentId === it.id }"
            @click="go(it.id)"
          >
            <AppIcon :name="it.icon" :size="20" />
            <span>{{ it.label }}</span>
            <span v-if="it.count != null" class="nav-count num">{{ formatNumber(it.count, locale) }}</span>
          </button>
        </template>
      </nav>

      <div class="sidebar-foot">
        <div class="sidebar-card">
          <h4>{{ t('upgrade') }}</h4>
          <p>{{ t('upgradeMsg') }}</p>
          <BaseButton variant="primary" small block>
            <AppIcon name="sparkle" :size="15" />{{ t('upgradeBtn') }}
          </BaseButton>
        </div>
      </div>
    </aside>

    <div class="main">
      <!--
        Without a .env file the panel falls back to the local backend, where
        every change is written to this browser and reaches neither the app nor
        anybody else. That is invisible until somebody notices the app showing
        different data, so it says so here instead.
      -->
      <div v-if="onLocalBackend" class="demo-bar">
        <AppIcon name="bell" :size="16" />
        <span>{{ t('demoBanner') }}</span>
      </div>

      <header class="header">
        <button
          class="icon-btn"
          style="display: var(--menu-display, none)"
          @click="ui.toggleMobileNav()"
        >
          <AppIcon name="menu" :size="20" />
        </button>
        <div class="header-title">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSub }}</p>
        </div>
        <div class="header-actions">
          <div class="lang-toggle">
            <button :class="{ on: locale === 'en' }" @click="setLocale('en')">EN</button>
            <button
              :class="{ on: locale === 'ar' }"
              style="font-family: var(--font-ar)"
              @click="setLocale('ar')"
            >
              ع
            </button>
          </div>
          <button class="icon-btn"><AppIcon name="bell" :size="20" /><span class="dot" /></button>
          <div style="position: relative">
            <button class="admin-chip" @click="menuOpen = !menuOpen">
              <AppAvatar :name="admin?.nameEn ?? t('admin_name')" color="#4A93BC" :size="36" />
              <div class="meta">
                <div class="nm">{{ locale === 'ar' ? admin?.nameAr ?? t('admin_name') : admin?.nameEn ?? t('admin_name') }}</div>
                <div class="rl">{{ admin?.role ?? t('admin_role') }}</div>
              </div>
            </button>
            <div v-if="menuOpen" class="menu-pop">
              <button class="danger" @click="onLogout">
                <AppIcon name="logout" :size="18" />{{ t('logout') }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>

    <div
      v-if="mobileNavOpen"
      style="position: fixed; inset: 0; background: rgba(31, 41, 51, 0.4); z-index: 25"
      @click="ui.closeMobileNav()"
    />

    <ToastHost />
  </div>
</template>
