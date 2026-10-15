<template>
  <ul class="conversation-list">
    <li
      v-for="conversation in conversations"
      :key="conversation.id"
      class="conversation-list__item card"
    >
      <NuxtLink
        :to="`/conversations/${conversation.id}`"
        class="conversation-list__link"
      >
        {{ conversation.title ?? 'Nouvelle conversation' }}
      </NuxtLink>
      <span class="conversation-list__date">{{ formatDateTime(conversation.lastActivityAt) }}</span>
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        size="small"
        :aria-label="`Supprimer la conversation « ${conversation.title ?? 'Nouvelle conversation'} »`"
        @click="emit('delete', conversation.id)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
/**
 * Liste des conversations, de la plus récente à la plus ancienne.
 */
import { NuxtLink } from '#components'
import Button from 'primevue/button'
import type { ConversationDto } from '@domains/conversation/application/dto/ConversationDto'
import { formatDateTime } from '@shared/presentation/composables/formatDate'

defineProps<{ conversations: ConversationDto[] }>()
const emit = defineEmits<{ delete: [conversationId: string] }>()
</script>

<style scoped lang="scss">
.conversation-list {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }

  &__link {
    flex: 1;
    font-weight: 600;
  }

  &__date {
    font-size: var(--font-size-small);
  }
}
</style>
