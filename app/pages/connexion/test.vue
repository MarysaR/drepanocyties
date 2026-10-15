<template>
  <section class="test-login">
    <h1>Connexion de test</h1>
    <template v-if="testMode">
      <p>
        Réservée aux tests locaux sur une base dédiée. Saisissez un identifiant de test :
        le compte correspondant est créé vide à la première connexion.
      </p>
      <form @submit.prevent="signIn">
        <div class="form-field">
          <label for="test-identity">Identifiant de test</label>
          <InputText
            id="test-identity"
            v-model="testIdentity"
            autocomplete="off"
            maxlength="64"
          />
          <p class="form-field__hint">
            Lettres minuscules, chiffres et tirets.
          </p>
        </div>
        <AppErrorMessage :error="signInError" />
        <Button
          type="submit"
          label="Se connecter (test)"
          :loading="isSigningIn"
          :disabled="!testIdentity.trim()"
        />
      </form>
    </template>
    <p v-else>
      Le mode test n’est pas activé sur ce serveur.
    </p>
  </section>
</template>

<script setup lang="ts">
/**
 * Connexion par identifiant de test, réservée au mode test local (E2E).
 */
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useTestSignIn } from '@domains/identity/presentation/composables/useTestSignIn'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'

definePageMeta({ layout: 'public' })
useHead({ title: 'Connexion de test' })

const testMode = useRuntimeConfig().public.testMode
const { testIdentity, signIn, isSigningIn, signInError } = useTestSignIn()
</script>

<style scoped lang="scss">
.test-login {
  max-width: 36rem;
  padding: var(--space-6);
  border-radius: var(--radius-large);
  background: var(--color-surface);
}
</style>
