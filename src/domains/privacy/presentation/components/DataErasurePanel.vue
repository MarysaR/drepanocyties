<template>
  <section
    class="erasure card"
    aria-labelledby="data-erasure-title"
  >
    <h2 id="data-erasure-title">
      Supprimer toutes mes données
    </h2>
    <p>
      Votre compte, vos conversations, vos souvenirs, votre journal et vos accords seront définitivement
      effacés de l’application. Cette action est irréversible. Les messages déjà transmis au fournisseur
      d’IA restent soumis à sa propre politique de conservation.
    </p>
    <form @submit.prevent="eraseAllData">
      <div class="form-field">
        <label for="erasure-confirmation">Pour confirmer, saisissez « {{ keyword }} »</label>
        <InputText
          id="erasure-confirmation"
          v-model="confirmation"
          autocomplete="off"
        />
      </div>
      <AppErrorMessage :error="error" />
      <Button
        type="submit"
        label="Supprimer définitivement mes données"
        severity="danger"
        :disabled="!canErase"
        :loading="isErasing"
      />
    </form>
  </section>
</template>

<script setup lang="ts">
/**
 * Effacement complet et irréversible des données de la personne.
 */
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import { usePersonalDataErasure } from '../composables/usePersonalDataErasure'

const { confirmation, canErase, eraseAllData, isErasing, error, keyword } = usePersonalDataErasure()
</script>

<style scoped lang="scss">
.erasure {
  border-color: var(--color-danger);
}
</style>
