<template>
  <p
    v-if="testMode"
    class="test-mode-banner"
    role="status"
  >
    Mode test local : comptes de test sur une base dédiée et réponses simulées, aucune IA réelle n’est appelée.
  </p>
</template>

<script setup lang="ts">
/**
 * Signale clairement le mode test (identités et IA simulées).
 */
const testMode = useRuntimeConfig().public.testMode
</script>

<style scoped lang="scss">
.test-mode-banner {
  margin: 0;
  padding: var(--space-2) var(--space-4);
  background: var(--color-ink);
  color: var(--color-white);
  font-size: var(--font-size-small);
  text-align: center;
}
</style>
