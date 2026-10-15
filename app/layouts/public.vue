<template>
  <div class="public-shell">
    <TestModeBanner />
    <main
      id="contenu"
      class="public-main"
    >
      <slot />
    </main>
    <footer class="public-footer">
      <SafetyNotice />
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Mise en page des pages publiques (accueil, connexion de test).
 */
</script>

<style scoped lang="scss">
.public-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-blush);
}

.public-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

.public-footer {
  padding: var(--space-4);
  text-align: center;
}
</style>
