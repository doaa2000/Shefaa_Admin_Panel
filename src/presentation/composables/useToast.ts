import { useToastStore, type ToastVariant } from '@/presentation/stores/toast.store';

export function useToast() {
  const store = useToastStore();
  function toast(message: string, variant: ToastVariant = 'ok'): void {
    store.notify(message, variant);
  }
  return { toast };
}
