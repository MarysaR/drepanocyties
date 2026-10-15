<template>
  <ol
    ref="listElement"
    class="message-list"
    role="log"
    aria-live="polite"
    aria-label="Messages de la conversation"
  >
    <ConversationMessageItem
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :remember-enabled="rememberEnabled"
      @remember="forwardRemember"
    />
    <li
      v-if="isTwinWriting"
      class="message-list__writing"
    >
      {{ productIdentity.twinNameCapitalized }} écrit…
    </li>
  </ol>
</template>

<script setup lang="ts">
/**
 * Fil des messages, annoncé aux technologies d'assistance et
 * défilant automatiquement vers le dernier message.
 */
import { nextTick, ref, watch } from 'vue'
import { productIdentity } from '@shared/config/productIdentity'
import type { DisplayedMessage } from '../composables/useConversation'
import ConversationMessageItem from './ConversationMessageItem.vue'

const props = defineProps<{ messages: DisplayedMessage[]; isTwinWriting: boolean; rememberEnabled: boolean }>()
const emit = defineEmits<{ remember: [message: { id: string; content: string }] }>()

const listElement = ref<HTMLOListElement | null>(null)

function forwardRemember(message: { id: string; content: string }): void {
  emit('remember', message)
}

async function scrollToLatest(): Promise<void> {
  await nextTick()
  listElement.value?.lastElementChild?.scrollIntoView({ block: 'end' })
}

watch(() => [props.messages.length, props.isTwinWriting], scrollToLatest)
</script>

<style scoped lang="scss">
.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;

  &__writing {
    font-style: italic;
  }
}
</style>
