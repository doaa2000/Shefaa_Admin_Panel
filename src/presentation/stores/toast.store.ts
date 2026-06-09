import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastVariant = 'ok' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

/** Centralized toast notifications (matches the design's toast host). */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([]);

  function notify(message: string, variant: ToastVariant = 'ok'): void {
    const id = Math.random().toString(36).slice(2);
    toasts.value.push({ id, message, variant });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 2600);
  }

  return { toasts, notify };
});
