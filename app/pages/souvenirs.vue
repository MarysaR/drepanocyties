<template>
  <div class="memories-page">
    <PageHeader
      title="Souvenirs"
      description="Ce que le jumeau retient de vous, uniquement avec votre accord. Vous pouvez tout corriger ou supprimer."
    />
    <AppErrorMessage :error="error" />

    <Message
      v-if="!isLoading && !overview.memoryEnabled"
      severity="warn"
    >
      La mémoire permanente est désactivée : vos souvenirs ne sont pas utilisés par le jumeau.
      <NuxtLink to="/confidentialite">
        Gérer mes accords
      </NuxtLink>
    </Message>

    <section
      v-if="overview.proposals.length > 0"
      aria-labelledby="pending-proposals-title"
    >
      <h2 id="pending-proposals-title">
        Propositions en attente
      </h2>
      <div class="memories-page__list">
        <MemoryProposalCard
          v-for="proposal in overview.proposals"
          :key="proposal.id"
          :proposal="proposal"
          :busy="isMutating"
          @accept="acceptProposal"
          @reject="rejectProposal"
        />
      </div>
    </section>

    <section aria-labelledby="memories-title">
      <h2 id="memories-title">
        Souvenirs retenus
      </h2>
      <ul
        v-if="overview.memories.length > 0"
        class="memories-page__list"
      >
        <MemoryItem
          v-for="memory in overview.memories"
          :key="memory.id"
          :memory="memory"
          :busy="isMutating"
          @correct="correctMemory"
          @delete="deleteMemory"
        />
      </ul>
      <EmptyState
        v-else-if="!isLoading"
        text="Aucun souvenir pour le moment."
      />
    </section>

    <MemoryComposer
      v-if="overview.memoryEnabled"
      v-model="newMemoryDraft"
      :busy="isMutating"
      @add="addMemory"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Espace Souvenirs : consulter, corriger, supprimer, ajouter et décider des propositions.
 */
import Message from 'primevue/message'
import { onMounted } from 'vue'
import MemoryComposer from '@domains/memory/presentation/components/MemoryComposer.vue'
import MemoryItem from '@domains/memory/presentation/components/MemoryItem.vue'
import MemoryProposalCard from '@domains/memory/presentation/components/MemoryProposalCard.vue'
import { useMemories } from '@domains/memory/presentation/composables/useMemories'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import EmptyState from '@shared/presentation/components/EmptyState.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Souvenirs' })

const { overview, newMemoryDraft, loadMemories, addMemory, correctMemory, deleteMemory, acceptProposal, rejectProposal, isLoading, isMutating, error } = useMemories()

onMounted(loadMemories)
</script>

<style scoped lang="scss">
.memories-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: var(--reading-width);

  &__list {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
  }
}
</style>
