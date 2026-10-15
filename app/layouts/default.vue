<template>
  <div class="app-shell">
    <a
      class="skip-link"
      href="#contenu"
    >Aller au contenu</a>
    <TestModeBanner />
    <header class="app-header">
      <div class="app-header__inner">
        <NuxtLink
          to="/tableau-de-bord"
          class="app-header__brand"
        >
          {{ productIdentity.productName }}
        </NuxtLink>
        <AppNavigation />
      </div>
    </header>
    <main
      id="contenu"
      class="app-main"
      tabindex="-1"
    >
      <slot />
    </main>
    <footer class="app-footer">
      <SafetyNotice />
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Mise en page des espaces personnels : en-tête, navigation, contenu et rappel de sécurité.
 */
import { productIdentity } from '@shared/config/productIdentity'
</script>

<style scoped lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.app-header {
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);

  &__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    max-width: var(--content-width);
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);
  }

  &__brand {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--color-accent);
    text-decoration: none;
  }
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);

  &:focus {
    outline: none;
  }
}

.app-footer {
  padding: var(--space-4);
  background: var(--color-blush);
  text-align: center;
}
</style>
