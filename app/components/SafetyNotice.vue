<template>
  <p class="safety-notice">
    {{ productIdentity.twinNameCapitalized }} ne remplace ni un professionnel de santé ni vos proches.
    En cas d’urgence médicale : <strong>{{ safetyResources.medicalEmergency }}</strong>.
    Si vous pensez au suicide : <strong>{{ safetyResources.suicidePrevention }}</strong>.
  </p>
</template>

<script setup lang="ts">
/**
 * Rappel permanent des limites du jumeau et des ressources d'urgence.
 */
import { productIdentity } from '@shared/config/productIdentity'
import { safetyResources } from '@shared/config/safetyResources'
</script>

<style scoped lang="scss">
.safety-notice {
  margin: 0;
  font-size: var(--font-size-small);
}
</style>
