<template>
  <form
    class="composer"
    @submit.prevent="submit"
  >
    <label
      for="message-composer-input"
      class="visually-hidden"
    >Votre message</label>
    <Textarea
      id="message-composer-input"
      v-model="draft"
      class="composer__input"
      rows="3"
      :maxlength="maxLength"
      placeholder="Écrivez ce que vous souhaitez partager…"
      aria-describedby="message-composer-hint"
      :disabled="disabled"
      @keydown.enter.exact.prevent="submit"
    />
    <div class="composer__footer">
      <p
        id="message-composer-hint"
        class="composer__hint"
      >
        Entrée pour envoyer, Maj + Entrée pour aller à la ligne · {{ draft.length }} / {{ maxLength }}
      </p>
      <Button
        type="submit"
        label="Envoyer"
        icon="pi pi-send"
        icon-pos="right"
        :loading="sending"
        :disabled="disabled || !draft.trim()"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * Zone de saisie d'un message au jumeau.
 */
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { MESSAGE_MAX_LENGTH } from '@domains/conversation/domain/value-objects/MessageContent'

const props = defineProps<{ sending: boolean; disabled: boolean }>()
const emit = defineEmits<{ send: [] }>()

const draft = defineModel<string>({ required: true })
const maxLength = MESSAGE_MAX_LENGTH

function submit(): void {
  if (!props.sending && !props.disabled && draft.value.trim()) emit('send')
}
</script>

<style scoped lang="scss">
.composer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  &__hint {
    margin: 0;
    font-size: var(--font-size-small);
  }
}
</style>
