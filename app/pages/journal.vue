<template>
  <div class="journal-page">
    <PageHeader
      title="Journal"
      description="Un espace privé pour noter ce que vous ressentez. Il n’est jamais transmis au jumeau."
    />
    <AppErrorMessage :error="error" />

    <section
      class="card"
      aria-labelledby="journal-new-title"
    >
      <h2 id="journal-new-title">
        Nouvelle entrée
      </h2>
      <JournalEntryForm
        submit-label="Ajouter au journal"
        :busy="isSaving"
        @submit="addEntry"
      />
    </section>

    <section aria-labelledby="journal-entries-title">
      <h2 id="journal-entries-title">
        Mes entrées
      </h2>
      <div
        v-if="entries.length > 0"
        class="journal-page__entries"
      >
        <JournalEntryCard
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
          :editing="editingEntryId === entry.id"
          :busy="isSaving"
          @edit="startEditing"
          @cancel="stopEditing"
          @update="updateEntry"
          @delete="deleteEntry"
        />
      </div>
      <EmptyState
        v-else
        text="Votre journal est vide pour le moment."
      />
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Journal émotionnel : création, consultation, modification et suppression d'entrées.
 */
import { onMounted } from 'vue'
import type { JournalEntryInput } from '@domains/journal/application/dto/JournalDto'
import JournalEntryCard from '@domains/journal/presentation/components/JournalEntryCard.vue'
import JournalEntryForm from '@domains/journal/presentation/components/JournalEntryForm.vue'
import { useJournal } from '@domains/journal/presentation/composables/useJournal'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import EmptyState from '@shared/presentation/components/EmptyState.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Journal' })

const { entries, editingEntryId, loadEntries, createEntry, updateEntry, deleteEntry, startEditing, stopEditing, isSaving, error } = useJournal()

async function addEntry(input: JournalEntryInput, resetForm: () => void): Promise<void> {
  if (await createEntry(input)) resetForm()
}

onMounted(loadEntries)
</script>

<style scoped lang="scss">
.journal-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: var(--reading-width);

  &__entries {
    display: grid;
    gap: var(--space-4);
  }
}
</style>
