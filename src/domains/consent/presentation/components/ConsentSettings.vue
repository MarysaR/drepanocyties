<template>
  <section
    class="consent-settings"
    aria-labelledby="consent-settings-title"
  >
    <h2 id="consent-settings-title">
      Vos accords
    </h2>
    <AppErrorMessage :error="error" />
    <div class="consent-settings__list">
      <ConsentCard
        v-for="state in states"
        :key="state.type"
        :state="state"
        :text="consentTexts[state.type]"
        :busy="isRecording"
        @decide="decide"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Gestion de l'ensemble des consentements de la personne.
 */
import { onMounted } from 'vue'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import { consentTexts } from '../consentTexts'
import { useConsents } from '../composables/useConsents'
import ConsentCard from './ConsentCard.vue'

const emit = defineEmits<{ changed: [] }>()

const { states, loadConsents, decide: recordDecision, isRecording, error } = useConsents()

async function decide(type: Parameters<typeof recordDecision>[0], granted: boolean): Promise<void> {
  await recordDecision(type, granted)
  emit('changed')
}

onMounted(loadConsents)
</script>

<style scoped lang="scss">
.consent-settings__list {
  display: grid;
  gap: var(--space-4);
}
</style>
