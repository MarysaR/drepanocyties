<template>
  <li
    class="message"
    :data-author="message.author"
    :aria-busy="message.pending ? 'true' : undefined"
  >
    <p class="message__author">
      {{ authorLabel }}
      <span
        v-if="message.pending"
        class="message__pending"
      >· envoi en cours…</span>
    </p>
    <div class="message__bubble">
      <p
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="message__paragraph"
      >
        {{ paragraph }}
      </p>
    </div>
    <Button
      v-if="canRemember"
      label="Retenir ce message"
      icon="pi pi-bookmark"
      size="small"
      text
      class="message__remember"
      @click="requestRemember"
    />
  </li>
</template>

<script setup lang="ts">
/**
 * Un message de la conversation ; la personne peut choisir de retenir ses propres messages.
 */
import Button from 'primevue/button'
import { computed } from 'vue'
import { productIdentity } from '@shared/config/productIdentity'
import type { DisplayedMessage } from '../composables/useConversation'

const props = defineProps<{ message: DisplayedMessage; rememberEnabled: boolean }>()
const emit = defineEmits<{ remember: [message: { id: string; content: string }] }>()

const authorLabel = computed(() => (props.message.author === 'PERSON' ? 'Vous' : productIdentity.twinNameCapitalized))
const paragraphs = computed(() => props.message.content.split(/\n{2,}/))
function requestRemember(): void {
  emit('remember', { id: props.message.id, content: props.message.content })
}

const canRemember = computed(() => props.rememberEnabled && props.message.author === 'PERSON' && !props.message.pending)
</script>

<style scoped lang="scss">
.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: min(40rem, 92%);

  &[data-author='PERSON'] {
    align-self: flex-end;
    align-items: flex-end;

    .message__bubble {
      background: var(--color-accent);
      color: var(--color-white);
      border-bottom-right-radius: var(--radius-small);
    }
  }

  &[data-author='TWIN'] .message__bubble {
    background: var(--color-blush);
    border-bottom-left-radius: var(--radius-small);
  }

  &__author {
    margin: 0 0 var(--space-1);
    font-size: var(--font-size-small);
    font-weight: 600;
  }

  &__bubble {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-large);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &__paragraph {
    margin: 0;

    & + & {
      margin-top: var(--space-2);
    }
  }
}
</style>
