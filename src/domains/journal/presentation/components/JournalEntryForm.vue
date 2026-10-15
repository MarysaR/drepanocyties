<template>
  <form
    class="journal-form"
    @submit.prevent="submit"
  >
    <div class="journal-form__row">
      <div class="form-field">
        <label :for="`${formId}-date`">Date</label>
        <InputText
          :id="`${formId}-date`"
          v-model="form.entryDate"
          type="date"
          :max="today"
          required
        />
      </div>
      <div class="form-field journal-form__title">
        <label :for="`${formId}-title`">Titre (facultatif)</label>
        <InputText
          :id="`${formId}-title`"
          v-model="form.title"
          maxlength="120"
        />
      </div>
    </div>

    <fieldset class="form-field">
      <legend>Comment vous sentez-vous ? (facultatif)</legend>
      <div class="journal-form__moods">
        <div class="choice-row">
          <RadioButton
            v-model="form.mood"
            :input-id="`${formId}-mood-none`"
            :name="`${formId}-mood`"
            :value="null"
          />
          <label :for="`${formId}-mood-none`">Je préfère ne pas dire</label>
        </div>
        <div
          v-for="mood in moods"
          :key="mood"
          class="choice-row"
        >
          <RadioButton
            v-model="form.mood"
            :input-id="`${formId}-mood-${mood}`"
            :name="`${formId}-mood`"
            :value="mood"
          />
          <label :for="`${formId}-mood-${mood}`">{{ moodLabels[mood] }}</label>
        </div>
      </div>
    </fieldset>

    <div class="form-field">
      <label :for="`${formId}-content`">Ce que vous souhaitez écrire</label>
      <Textarea
        :id="`${formId}-content`"
        v-model="form.content"
        rows="6"
        maxlength="10000"
        required
      />
    </div>

    <div class="actions-row">
      <Button
        type="submit"
        :label="submitLabel"
        :loading="busy"
        :disabled="!form.content.trim()"
      />
      <Button
        v-if="cancellable"
        label="Annuler"
        severity="secondary"
        outlined
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * Formulaire d'entrée du journal (création ou modification).
 */
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import { reactive, useId } from 'vue'
import type { JournalEntryDto, JournalEntryInput } from '@domains/journal/application/dto/JournalDto'
import { moods, type Mood } from '@domains/journal/domain/value-objects/Mood'
import { todayIsoDate } from '@shared/presentation/composables/formatDate'
import { moodLabels } from '../moodLabels'

const props = defineProps<{ entry?: JournalEntryDto; submitLabel: string; busy: boolean; cancellable?: boolean }>()
const emit = defineEmits<{ submit: [input: JournalEntryInput, reset: () => void]; cancel: [] }>()

const formId = useId()
const today = todayIsoDate()

const emptyForm = () => ({ entryDate: today, title: '', content: '', mood: null as Mood | null })

const form = reactive(props.entry
  ? { entryDate: props.entry.entryDate, title: props.entry.title ?? '', content: props.entry.content, mood: props.entry.mood }
  : emptyForm())

function reset(): void {
  Object.assign(form, emptyForm())
}

function submit(): void {
  emit('submit', { entryDate: form.entryDate, title: form.title || null, content: form.content, mood: form.mood }, reset)
}
</script>

<style scoped lang="scss">
.journal-form {
  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  &__title {
    flex: 1;
    min-width: 14rem;
  }

  &__moods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: var(--space-2);
  }
}
</style>
