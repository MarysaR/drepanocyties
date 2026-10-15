<template>
  <form
    class="memory-composer card"
    @submit.prevent="submit"
  >
    <label for="memory-composer-content">Écrire un souvenir que vous souhaitez confier au jumeau</label>
    <Textarea
      id="memory-composer-content"
      v-model="draft"
      rows="2"
      maxlength="500"
    />
    <Button
      type="submit"
      label="Ajouter"
      :disabled="!draft.trim()"
      :loading="busy"
    />
  </form>
</template>

<script setup lang="ts">
/**
 * Ajout d'un souvenir rédigé directement par la personne.
 */
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

defineProps<{ busy: boolean }>()
const emit = defineEmits<{ add: [content: string] }>()

const draft = defineModel<string>({ required: true })

function submit(): void {
  emit('add', draft.value)
}
</script>

<style scoped lang="scss">
.memory-composer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
}
</style>
