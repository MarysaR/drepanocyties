<template>
  <div>
    <PageHeader
      title="Conversations"
      description="Reprenez une conversation ou commencez-en une nouvelle."
    >
      <template #actions>
        <Button
          label="Nouvelle conversation"
          icon="pi pi-plus"
          :loading="isStarting"
          @click="startConversation"
        />
      </template>
    </PageHeader>
    <AppErrorMessage :error="error" />
    <ConversationList
      v-if="conversations.length > 0"
      :conversations="conversations"
      @delete="deleteConversation"
    />
    <EmptyState
      v-else-if="!isLoading"
      text="Vous n’avez pas encore de conversation."
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Liste des conversations de la personne.
 */
import Button from 'primevue/button'
import { onMounted } from 'vue'
import ConversationList from '@domains/conversation/presentation/components/ConversationList.vue'
import { useConversationList } from '@domains/conversation/presentation/composables/useConversationList'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import EmptyState from '@shared/presentation/components/EmptyState.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Conversations' })

const { conversations, loadConversations, startConversation, deleteConversation, isLoading, isStarting, error } = useConversationList()

onMounted(loadConversations)
</script>
