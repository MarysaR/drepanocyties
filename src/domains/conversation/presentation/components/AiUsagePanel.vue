<template>
  <section
    class="ai-usage card"
    aria-labelledby="ai-usage-title"
  >
    <h2 id="ai-usage-title">
      Consommation de l’IA
    </h2>
    <AppErrorMessage :error="error" />
    <template v-if="summary">
      <p class="ai-usage__figures">
        <strong>{{ spentLabel }}</strong> estimés sur un plafond de {{ budgetLabel }}
        · {{ summary.requestCount }} {{ summary.requestCount > 1 ? 'réponses' : 'réponse' }}
      </p>
      <progress
        class="ai-usage__bar"
        :value="usedPercent"
        max="100"
        aria-label="Part du plafond de consommation utilisée"
      >
        {{ usedPercent }} %
      </progress>
      <p class="ai-usage__note">
        Estimation calculée par l’application d’après les tokens consommés. Seule la console du fournisseur
        fait foi pour la facturation : ce plafond est un garde-fou, pas une garantie.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
/**
 * Suivi de la consommation estimée de l'IA et de son plafond applicatif.
 */
import { onMounted } from 'vue'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import { useAiUsage } from '../composables/useAiUsage'

const { summary, loadUsage, spentLabel, budgetLabel, usedPercent, error } = useAiUsage()

onMounted(loadUsage)
</script>

<style scoped lang="scss">
.ai-usage {
  margin-top: var(--space-6);

  h2 {
    margin-top: 0;
  }

  &__figures {
    margin: 0 0 var(--space-2);
  }

  &__bar {
    width: 100%;
    height: 0.75rem;
    accent-color: var(--color-accent);
  }

  &__note {
    margin: var(--space-3) 0 0;
    font-size: var(--font-size-small);
  }
}
</style>
