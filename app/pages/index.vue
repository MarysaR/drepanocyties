<template>
  <section class="welcome">
    <h1 class="welcome__title">
      {{ productIdentity.productName }}
    </h1>
    <p class="welcome__tagline">
      {{ productIdentity.tagline }}
    </p>
    <p>
      {{ productIdentity.productName }} est un compagnon d’écoute pour les personnes concernées par la drépanocytose : il vous croit,
      respecte votre rythme et ne retient que ce que vous choisissez de lui confier.
    </p>
    <Message
      v-if="notice"
      severity="info"
      role="status"
    >
      {{ notice }}
    </Message>
    <div class="actions-row welcome__actions">
      <a
        class="ui-button ui-button--primary"
        href="/auth/auth0"
      >Se connecter</a>
      <a
        class="ui-button ui-button--secondary"
        href="/auth/auth0?intent=signup"
      >Créer un compte</a>
    </div>
    <p
      v-if="testMode"
      class="welcome__test"
    >
      <NuxtLink to="/connexion/test">
        Connexion de test (mode test local)
      </NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
/**
 * Accueil public : présentation et accès à la connexion ou à l'inscription (Auth0).
 */
import Message from 'primevue/message'
import { computed } from 'vue'
import { productIdentity } from '@shared/config/productIdentity'

definePageMeta({ layout: 'public' })
useHead({ title: 'Bienvenue' })

const route = useRoute()
const testMode = useRuntimeConfig().public.testMode

const notice = computed(() => {
  if (route.query.erreur === 'connexion') return 'La connexion n’a pas abouti. Vous pouvez réessayer.'
  if (route.query.erreur === 'inscription') return 'Les inscriptions sont fermées sur cet espace de test.'
  if (route.query.erreur === 'session') return 'Votre session a expiré. Merci de vous reconnecter.'
  if (route.query.compte === 'supprime') return 'Vos données ont été supprimées. Prenez soin de vous.'
  return ''
})
</script>

<style scoped lang="scss">
.welcome {
  max-width: 36rem;
  padding: var(--space-6);
  border-radius: var(--radius-large);
  background: var(--color-surface);

  &__title {
    margin-top: 0;
  }

  &__tagline {
    font-family: var(--font-display);
    font-size: var(--font-size-large);
    color: var(--color-accent);
  }

  &__actions {
    margin-top: var(--space-5);
  }

  &__test {
    margin-bottom: 0;
  }
}
</style>
