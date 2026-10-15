<template>
  <div class="empty-state">
    <p class="empty-state__text">
      {{ text }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * Message affiché lorsqu'une liste est vide.
 */
defineProps<{ text: string }>()
</script>

<style scoped lang="scss">
.empty-state {
  padding: var(--space-6);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-large);
  background: var(--color-surface-soft);
  text-align: center;

  &__text {
    margin: 0 0 var(--space-3);
  }
}
</style>
