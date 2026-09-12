import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/presentation/layouts/AdminLayout.vue';
import AuthLayout from '@/presentation/layouts/AuthLayout.vue';

/** Route table. `meta.requiresAuth` is enforced by the global guard. */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/presentation/pages/DashboardPage.vue') },
      { path: 'doctors', name: 'doctors', component: () => import('@/presentation/pages/DoctorsPage.vue') },
      {
        path: 'specializations',
        name: 'specializations',
        component: () => import('@/presentation/pages/SpecializationsPage.vue'),
      },
      { path: 'locations', name: 'locations', component: () => import('@/presentation/pages/LocationsPage.vue') },
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('@/presentation/pages/AppointmentsPage.vue'),
      },
      { path: 'users', name: 'users', component: () => import('@/presentation/pages/UsersPage.vue') },
      { path: 'banners', name: 'banners', component: () => import('@/presentation/pages/BannersPage.vue') },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: () => import('@/presentation/pages/auth/LoginPage.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/presentation/pages/NotFoundPage.vue'),
  },
];
