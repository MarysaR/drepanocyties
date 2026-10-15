<template>
  <article
    class="memory-proposal"
    aria-label="Proposition de souvenir"
  >
    <p class="memory-proposal__intro">
      Le jumeau vous propose de retenir :
    </p>
    <template v-if="isEditing">
      <label
        :for="editorId"
        class="visually-hidden"
      >Reformuler le souvenir</label>
      <Textarea
        :id="editorId"
        v-model="draft"
        rows="2"
        maxlength="500"
      />
    </template>
    <blockquote
      v-else
      class="memory-proposal__content"
    >
      {{ proposal.content }}
    </blockquote>
    <div class="actions-row">
      <Button
        :label="isEditing ? 'Retenir cette version' : 'Retenir'"
        size="small"
        :loading="busy"
        @click="accept"
      />
      <Button
        v-if="!isEditing"
        label="Modifier avant de retenir"
        size="small"
        severity="secondary"
        outlined
        :disabled="busy"
        @click="startEditing"
      />
      <Button
        label="Ne pas retenir"
        size="small"
        text
        :disabled="busy"
        @click="emit('reject', proposal.id)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Proposition de souvenir du jumeau : la personne retient, reformule ou refuse.
 */
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { ref, useId } from 'vue'

const props = defineProps<{ proposal: { id: string; content: string }; busy: boolean }>()
const emit = defineEmits<{ accept: [proposalId: string, content?: string]; reject: [proposalId: string] }>()

const editorId = useId()
const isEditing = ref(false)
const draft = ref(props.proposal.content)

function startEditing(): void {
  isEditing.value = true
}

function accept(): void {
  emit('accept', props.proposal.id, isEditing.value ? draft.value : undefined)
}
</script>

<style scoped lang="scss">
.memory-proposal {
  padding: var(--space-4);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-large);
  background: var(--color-violet-tint);

  &__intro {
    margin: 0 0 var(--space-2);
    font-weight: 600;
  }

  &__content {
    margin: 0 0 var(--space-3);
    font-family: var(--font-display);
    font-size: var(--font-size-large);
  }
}
</style>
