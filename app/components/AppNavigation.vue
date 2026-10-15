<template>
  <nav
    class="app-nav"
    aria-label="Navigation principale"
  >
    <Button
      class="app-nav__toggle"
      :label="isMenuOpen ? 'Fermer le menu' : 'Menu'"
      icon="pi pi-bars"
      severity="secondary"
      outlined
      size="small"
      aria-controls="app-nav-links"
      :aria-expanded="isMenuOpen"
      @click="toggleMenu"
    />
    <ul
      id="app-nav-links"
      class="app-nav__links"
      :data-open="isMenuOpen"
    >
      <li
        v-for="link in links"
        :key="link.to"
      >
        <NuxtLink
          :to="link.to"
          class="app-nav__link"
          @click="closeMenu"
        >
          {{ link.label }}
        </NuxtLink>
      </li>
      <li>
        <Button
          label="Se déconnecter"
          icon="pi pi-sign-out"
          size="small"
          text
          :loading="isSigningOut"
          @click="signOut"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
/**
 * Navigation principale, repliable sur petit écran, et déconnexion.
 */
import Button from 'primevue/button'
import { ref } from 'vue'
import { useSignOut } from '@domains/identity/presentation/composables/useSignOut'

const { signOut, isSigningOut } = useSignOut()
const isMenuOpen = ref(false)

const links = [
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/conversations', label: 'Conversations' },
  { to: '/souvenirs', label: 'Souvenirs' },
  { to: '/journal', label: 'Journal' },
  { to: '/profil', label: 'Profil' },
  { to: '/confidentialite', label: 'Confidentialité' },
]

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(): void {
  isMenuOpen.value = false
}
</script>

<style scoped lang="scss">
.app-nav {
  &__toggle {
    display: none;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    display: inline-block;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      background: var(--color-blush);
    }

    &.router-link-active {
      background: var(--color-violet-tint);
      color: var(--color-accent);
      font-weight: 600;
    }
  }

  @media (max-width: 52rem) {
    &__toggle {
      display: inline-flex;
    }

    &__links {
      display: none;
      flex-direction: column;
      align-items: stretch;
      padding-top: var(--space-3);

      &[data-open='true'] {
        display: flex;
      }
    }
  }
}
</style>
