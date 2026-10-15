<template>
  <li class="memory-item card">
    <form
      v-if="isEditing"
      class="memory-item__editor"
      @submit.prevent="saveCorrection"
    >
      <label :for="editorId">Corriger ce souvenir</label>
      <Textarea
        :id="editorId"
        v-model="draft"
        rows="3"
        maxlength="500"
      />
      <div class="actions-row">
        <Button
          type="submit"
          label="Enregistrer la correction"
          size="small"
          :loading="busy"
        />
        <Button
          label="Annuler"
          size="small"
          severity="secondary"
          outlined
          @click="cancelEditing"
        />
      </div>
    </form>
    <template v-else>
      <p class="memory-item__content">
        {{ memory.content }}
      </p>
      <p class="memory-item__meta">
        {{ memoryOriginLabels[memory.origin] }} · {{ formatLongDate(memory.updatedAt) }}
      </p>
      <div class="actions-row">
        <Button
          label="Corriger"
          icon="pi pi-pencil"
          size="small"
          severity="secondary"
          outlined
          @click="startEditing"
        />
        <Button
          label="Supprimer"
          icon="pi pi-trash"
          size="small"
          severity="danger"
          text
          :disabled="busy"
          @click="emit('delete', memory.id)"
        />
      </div>
    </template>
  </li>
</template>

<script setup lang="ts">
/**
 * Un souvenir retenu : lecture, correction en place et suppression.
 */
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { ref, useId } from 'vue'
import type { MemoryDto } from '@domains/memory/application/dto/MemoryDto'
import { formatLongDate } from '@shared/presentation/composables/formatDate'
import { memoryOriginLabels } from '../memoryLabels'

const props = defineProps<{ memory: MemoryDto; busy: boolean }>()
const emit = defineEmits<{ correct: [memoryId: string, content: string]; delete: [memoryId: string] }>()

const editorId = useId()
const isEditing = ref(false)
const draft = ref('')

function startEditing(): void {
  draft.value = props.memory.content
  isEditing.value = true
}

function cancelEditing(): void {
  isEditing.value = false
}

function saveCorrection(): void {
  emit('correct', props.memory.id, draft.value)
  isEditing.value = false
}
</script>

<style scoped lang="scss">
.memory-item {
  list-style: none;

  &__content {
    margin: 0 0 var(--space-1);
    font-size: var(--font-size-large);
  }

  &__meta {
    margin: 0 0 var(--space-3);
    font-size: var(--font-size-small);
  }

  &__editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
