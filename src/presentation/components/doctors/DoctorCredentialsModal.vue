<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/presentation/components/ui/BaseModal.vue';
import BaseButton from '@/presentation/components/ui/BaseButton.vue';
import AppIcon from '@/presentation/components/ui/AppIcon.vue';
import { useI18n } from '@/presentation/composables/useI18n';

const props = defineProps<{ doctorName: string; email: string; password: string }>();
defineEmits<{ close: [] }>();

const { t } = useI18n();
const copied = ref('');

/**
 * Copies, and says so.
 *
 * The clipboard API needs a secure context and permission, and refuses
 * silently where it does not have them — which would look exactly like a
 * working button. When it refuses, the field is selected instead so the
 * keyboard can finish the job.
 */
async function copy(what: 'email' | 'password' | 'both'): Promise<void> {
  const text =
    what === 'email' ? props.email
    : what === 'password' ? props.password
    : `${props.email}\n${props.password}`;
  try {
    await navigator.clipboard.writeText(text);
    copied.value = what;
    window.setTimeout(() => (copied.value = ''), 2200);
  } catch {
    copied.value = 'failed';
  }
}
</script>

<template>
  <BaseModal :title="t('account_ready')" :subtitle="doctorName" @close="$emit('close')">
    <div class="cred">
      <!-- Said before the password, not after: somebody who closes this on
           reflex has lost it, and the only way back is to issue another. -->
      <p class="warn">
        <AppIcon name="alert" :size="17" />
        <span>{{ t('account_once_warning') }}</span>
      </p>

      <div class="field">
        <div class="field-label">{{ t('email') }}</div>
        <div class="field-row">
          <code class="value" dir="ltr">{{ email }}</code>
          <button type="button" class="copy" :title="t('copy')" @click="copy('email')">
            <AppIcon name="copy" :size="15" />
          </button>
        </div>
      </div>

      <div class="field">
        <div class="field-label">{{ t('temp_password') }}</div>
        <div class="field-row">
          <code class="value pw" dir="ltr">{{ password }}</code>
          <button type="button" class="copy" :title="t('copy')" @click="copy('password')">
            <AppIcon name="copy" :size="15" />
          </button>
        </div>
      </div>

      <p v-if="copied === 'failed'" class="copy-note err">{{ t('copy_failed') }}</p>
      <p v-else-if="copied" class="copy-note">{{ t('copied') }}</p>

      <p class="next">{{ t('account_next_steps') }}</p>
    </div>

    <template #footer>
      <BaseButton variant="soft" @click="copy('both')">{{ t('copy_both') }}</BaseButton>
      <BaseButton @click="$emit('close')">{{ t('done') }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.cred { display: flex; flex-direction: column; gap: 16px; }
.warn {
  display: flex; gap: 10px; align-items: flex-start; margin: 0;
  background: var(--warn-soft); color: var(--warn);
  border-radius: 12px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12.5px; font-weight: 600; color: var(--txt-2); }
.field-row {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border); border-radius: 12px;
  background: var(--surface-2); padding: 10px 12px;
}
.value {
  flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px; color: var(--txt); word-break: break-all;
}
.pw { font-size: 17px; letter-spacing: .06em; font-weight: 600; }
.copy {
  flex: 0 0 auto; display: grid; place-items: center;
  width: 32px; height: 32px; border-radius: 9px; cursor: pointer;
  border: 1px solid var(--border); background: var(--surface); color: var(--txt-2);
}
.copy:hover { color: var(--accent-deep); border-color: var(--accent); }
.copy-note { margin: -8px 0 0; font-size: 12.5px; color: var(--ok); }
.copy-note.err { color: var(--danger); }
.next { margin: 0; font-size: 13.5px; color: var(--txt-2); line-height: 1.7; }
</style>
