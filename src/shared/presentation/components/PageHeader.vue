<template>
  <header class="page-header">
    <div>
      <h1 class="page-header__title">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="page-header__description"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="page-header__actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * En-tête de page : titre principal, description et actions.
 */
defineProps<{ title: string; description?: string }>()
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);

  &__title {
    margin: 0;
  }

  &__description {
    margin: var(--space-2) 0 0;
    max-width: 60ch;
  }

  &__actions {
    display: flex;
    gap: var(--space-2);
  }
}
</style>
