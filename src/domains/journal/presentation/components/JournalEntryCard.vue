<template>
  <article
    class="journal-entry card"
    :aria-labelledby="headingId"
  >
    <JournalEntryForm
      v-if="editing"
      :entry="entry"
      submit-label="Enregistrer les modifications"
      :busy="busy"
      cancellable
      @submit="forwardUpdate"
      @cancel="emit('cancel')"
    />
    <template v-else>
      <header class="journal-entry__header">
        <h3 :id="headingId">
          {{ entry.title ?? formatLongDate(entry.entryDate) }}
        </h3>
        <p class="journal-entry__meta">
          <span v-if="entry.title">{{ formatLongDate(entry.entryDate) }}</span>
          <span
            v-if="entry.mood"
            class="journal-entry__mood"
          >{{ moodLabels[entry.mood] }}</span>
        </p>
      </header>
      <p class="journal-entry__content">
        {{ entry.content }}
      </p>
      <div class="actions-row">
        <Button
          label="Modifier"
          icon="pi pi-pencil"
          size="small"
          severity="secondary"
          outlined
          @click="emit('edit', entry.id)"
        />
        <Button
          label="Supprimer"
          icon="pi pi-trash"
          size="small"
          severity="danger"
          text
          :disabled="busy"
          @click="emit('delete', entry.id)"
        />
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
/**
 * Une entrée du journal, avec modification en place et suppression.
 */
import Button from 'primevue/button'
import { useId } from 'vue'
import type { JournalEntryDto, JournalEntryInput } from '@domains/journal/application/dto/JournalDto'
import { formatLongDate } from '@shared/presentation/composables/formatDate'
import { moodLabels } from '../moodLabels'
import JournalEntryForm from './JournalEntryForm.vue'

const props = defineProps<{ entry: JournalEntryDto; editing: boolean; busy: boolean }>()
const emit = defineEmits<{ edit: [entryId: string]; cancel: []; update: [entryId: string, input: JournalEntryInput]; delete: [entryId: string] }>()

const headingId = useId()

function forwardUpdate(input: JournalEntryInput): void {
  emit('update', props.entry.id, input)
}
</script>

<style scoped lang="scss">
.journal-entry {
  &__header h3 {
    margin: 0;
  }

  &__meta {
    display: flex;
    gap: var(--space-3);
    margin: var(--space-1) 0 var(--space-3);
    font-size: var(--font-size-small);
  }

  &__mood {
    padding: 0 var(--space-2);
    border-radius: var(--radius-pill);
    background: var(--color-blush);
  }

  &__content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
}
</style>
