<template>
  <NuxtLink
    :to="to"
    class="dashboard-tile card"
  >
    <span
      :class="['dashboard-tile__icon', 'pi', icon]"
      aria-hidden="true"
    />
    <span class="dashboard-tile__title">{{ title }}</span>
    <span class="dashboard-tile__summary">{{ summary }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * Accès rapide vers un espace de l'application, avec un résumé.
 */
import { NuxtLink } from '#components'

defineProps<{ to: string; icon: string; title: string; summary: string }>()
</script>

<style scoped lang="scss">
.dashboard-tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--color-text);
  text-decoration: none;

  &:hover {
    border-color: var(--color-accent);
    background: var(--color-blush);
  }

  &__icon {
    font-size: 1.5rem;
    color: var(--color-accent);
  }

  &__title {
    font-family: var(--font-display);
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--color-accent);
  }
}
</style>
