<template>
  <div class="conversation-page">
    <PageHeader :title="conversation?.title ?? 'Nouvelle conversation'">
      <template #actions>
        <NuxtLink to="/conversations">
          Toutes les conversations
        </NuxtLink>
      </template>
    </PageHeader>

    <AppErrorMessage :error="loadError" />

    <Message
      v-if="consentsLoaded && !aiAllowed"
      severity="warn"
    >
      Pour discuter avec le jumeau, votre accord au traitement de vos messages par une IA est nécessaire.
      <NuxtLink to="/confidentialite">
        Gérer mes accords
      </NuxtLink>
    </Message>

    <EmptyState
      v-if="!isLoading && messages.length === 0 && aiAllowed"
      text="Vous pouvez écrire ce que vous voulez, quand vous voulez. Il n’y a pas de bonne ou de mauvaise façon de commencer."
    />

    <ConversationMessageList
      :messages="messages"
      :is-twin-writing="isSending"
      :remember-enabled="memoryAllowed"
      @remember="openRememberDialog"
    />

    <div
      v-if="proposals.length > 0"
      class="conversation-page__proposals"
    >
      <MemoryProposalCard
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
        :busy="isDeciding"
        @accept="acceptProposal"
        @reject="rejectProposal"
      />
    </div>

    <Message
      v-if="proposalsFailed"
      severity="warn"
    >
      La réponse est bien enregistrée, mais une proposition de souvenir n’a pas pu être préparée.
    </Message>
    <AppErrorMessage :error="memoryError" />
    <AppErrorMessage :error="sendError" />

    <MessageComposer
      v-model="draft"
      class="conversation-page__composer"
      :sending="isSending"
      :disabled="!aiAllowed"
      @send="submitMessage"
    />

    <RememberMessageDialog
      :message="messageToRemember"
      :busy="isDeciding"
      :error="memoryError"
      @close="closeRememberDialog"
      @confirm="rememberMessage"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Conversation avec le jumeau : historique, envoi de messages et décisions
 * sur les souvenirs proposés ou choisis.
 */
import Message from 'primevue/message'
import { computed, onMounted, ref } from 'vue'
import { useConsents } from '@domains/consent/presentation/composables/useConsents'
import ConversationMessageList from '@domains/conversation/presentation/components/ConversationMessageList.vue'
import MessageComposer from '@domains/conversation/presentation/components/MessageComposer.vue'
import { useConversation } from '@domains/conversation/presentation/composables/useConversation'
import MemoryProposalCard from '@domains/memory/presentation/components/MemoryProposalCard.vue'
import RememberMessageDialog from '@domains/memory/presentation/components/RememberMessageDialog.vue'
import { useConversationMemoryActions } from '@domains/memory/presentation/composables/useConversationMemoryActions'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import EmptyState from '@shared/presentation/components/EmptyState.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Conversation' })

const route = useRoute()
const conversationId = String(route.params.id)

const { conversation, messages, draft, loadConversation, sendMessage, isLoading, loadError, isSending, sendError } = useConversation(conversationId)
const { proposals, messageToRemember, addProposals, acceptProposal, rejectProposal, openRememberDialog, closeRememberDialog, rememberMessage, isDeciding, memoryError } = useConversationMemoryActions()
const { loadConsents, isGranted, states } = useConsents()

const proposalsFailed = ref(false)
const consentsLoaded = computed(() => states.value.length > 0)
const aiAllowed = computed(() => isGranted('AI_PROCESSING'))
const memoryAllowed = computed(() => isGranted('PERSISTENT_MEMORY'))

async function submitMessage(): Promise<void> {
  const result = await sendMessage()
  if (!result) return
  proposalsFailed.value = result.memoryProposalsFailed
  addProposals(result.memoryProposals)
}

onMounted(() => Promise.all([loadConversation(), loadConsents()]))
</script>

<style scoped lang="scss">
.conversation-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: var(--reading-width);
  margin: 0 auto;

  &__proposals {
    display: grid;
    gap: var(--space-3);
  }

  &__composer {
    position: sticky;
    bottom: 0;
    padding: var(--space-3) 0;
    background: var(--color-surface);
  }
}
</style>
