<template>
  <Dialog
    :visible="message !== null"
    modal
    header="Retenir ce message"
    :style="{ width: '32rem' }"
    @update:visible="closeIfHidden"
  >
    <form
      id="remember-message-form"
      class="remember-form"
      @submit.prevent="submit"
    >
      <label for="remember-message-content">Vous pouvez reformuler ce que le jumeau retiendra :</label>
      <Textarea
        id="remember-message-content"
        v-model="draft"
        rows="4"
        maxlength="500"
      />
      <p class="form-field__hint">
        500 caractères maximum. Vous pourrez le corriger ou le supprimer à tout moment.
      </p>
      <AppErrorMessage :error="error" />
    </form>
    <template #footer>
      <Button
        label="Annuler"
        severity="secondary"
        outlined
        @click="emit('close')"
      />
      <Button
        type="submit"
        form="remember-message-form"
        label="Retenir"
        :loading="busy"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
/**
 * Fenêtre permettant de retenir l'un de ses messages comme souvenir, après relecture.
 */
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { ref, watch } from 'vue'
import type { AppError } from '@shared/errors/AppError'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'

const props = defineProps<{ message: { id: string; content: string } | null; busy: boolean; error: Readonly<AppError> | null }>()
const emit = defineEmits<{ close: []; confirm: [content: string] }>()

const draft = ref('')

watch(() => props.message, (message) => { draft.value = message?.content.slice(0, 500) ?? '' })

function closeIfHidden(visible: boolean): void {
  if (!visible) emit('close')
}

function submit(): void {
  emit('confirm', draft.value)
}
</script>

<style scoped lang="scss">
.remember-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}
</style>
