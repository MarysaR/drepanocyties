<template>
  <article
    class="consent-card card"
    :aria-labelledby="titleId"
  >
    <header class="consent-card__header">
      <h3 :id="titleId">
        {{ text.title }}
      </h3>
      <span
        class="consent-card__status"
        :data-status="state.status"
      >
        {{ statusLabel }}
      </span>
    </header>
    <p
      v-for="paragraph in text.paragraphs"
      :key="paragraph"
    >
      {{ paragraph }}
    </p>
    <div class="actions-row">
      <Button
        v-if="state.status !== 'granted'"
        label="J’accepte"
        :loading="busy"
        @click="grant"
      />
      <Button
        v-if="state.status !== 'refused'"
        :label="state.status === 'granted' ? 'Retirer mon accord' : 'Je refuse'"
        severity="secondary"
        outlined
        :loading="busy"
        @click="refuse"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Présente un consentement, son état et les actions explicites d'accord ou de retrait.
 */
import Button from 'primevue/button'
import { computed, useId } from 'vue'
import type { ConsentStateDto } from '@domains/consent/application/dto/ConsentDto'
import type { ConsentText } from '../consentTexts'

const props = defineProps<{ state: ConsentStateDto; text: ConsentText; busy: boolean }>()
const emit = defineEmits<{ decide: [type: ConsentStateDto['type'], granted: boolean] }>()

function grant(): void {
  emit('decide', props.state.type, true)
}

function refuse(): void {
  emit('decide', props.state.type, false)
}

const titleId = useId()

const statusLabels: Record<ConsentStateDto['status'], string> = {
  granted: 'Accordé',
  refused: 'Refusé',
  not_decided: 'En attente de votre choix',
  outdated: 'Texte mis à jour : à relire',
}

const statusLabel = computed(() => statusLabels[props.state.status])
</script>

<style scoped lang="scss">
.consent-card {
  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);

    h3 {
      margin: 0;
    }
  }

  &__status {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    background: var(--color-blush);
    font-size: var(--font-size-small);
    font-weight: 600;

    &[data-status='granted'] {
      background: var(--color-violet-tint);
      color: var(--color-accent);
    }
  }
}
</style>
