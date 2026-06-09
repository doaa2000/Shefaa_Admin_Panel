<script setup lang="ts">
import { RouterView } from 'vue-router';
import ToastHost from '@/presentation/components/ui/ToastHost.vue';
</script>

<template>
  <div class="auth-wrap">
    <RouterView />
  </div>
  <ToastHost />
</template>
