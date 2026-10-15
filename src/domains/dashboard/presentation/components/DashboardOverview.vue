<template>
  <div class="dashboard">
    <AppErrorMessage :error="error" />
    <template v-if="overview">
      <section
        v-if="needsConsentDecision"
        class="dashboard__onboarding card"
        aria-labelledby="dashboard-onboarding-title"
      >
        <h2 id="dashboard-onboarding-title">
          Avant de commencer
        </h2>
        <p>
          Prenez le temps de choisir ce que vous acceptez. Rien n’est activé sans votre accord,
          et vous pourrez changer d’avis à tout moment.
        </p>
        <NuxtLink to="/confidentialite">
          Choisir mes accords
        </NuxtLink>
      </section>

      <div class="dashboard__grid">
        <DashboardTile
          to="/conversations"
          icon="pi-comments"
          title="Conversations"
          :summary="conversationSummary"
        />
        <DashboardTile
          to="/souvenirs"
          icon="pi-bookmark"
          title="Souvenirs"
          :summary="memorySummary"
        />
        <DashboardTile
          to="/journal"
          icon="pi-book"
          title="Journal"
          :summary="journalSummary"
        />
        <DashboardTile
          to="/profil"
          icon="pi-user"
          title="Profil"
          summary="Votre prénom et vos préférences"
        />
        <DashboardTile
          to="/confidentialite"
          icon="pi-shield"
          title="Confidentialité"
          :summary="privacySummary"
        />
      </div>

      <section
        v-if="overview.conversations.latest"
        class="dashboard__resume"
        aria-labelledby="dashboard-resume-title"
      >
        <h2 id="dashboard-resume-title">
          Reprendre là où vous en étiez
        </h2>
        <NuxtLink :to="`/conversations/${overview.conversations.latest.id}`">
          {{ overview.conversations.latest.title ?? 'Dernière conversation' }}
        </NuxtLink>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Vue d'ensemble : accès aux conversations, souvenirs, journal, profil et confidentialité.
 */
import { NuxtLink } from '#components'
import { computed, onMounted } from 'vue'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import { formatLongDate } from '@shared/presentation/composables/formatDate'
import { useDashboard } from '../composables/useDashboard'
import DashboardTile from './DashboardTile.vue'

const { overview, loadOverview, error } = useDashboard()

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count > 1 ? pluralForm : singular}`

const needsConsentDecision = computed(() => {
  const consents = overview.value?.consents
  return !!consents && [consents.aiProcessing, consents.persistentMemory].some(status => status === 'not_decided' || status === 'outdated')
})

const conversationSummary = computed(() => plural(overview.value?.conversations.count ?? 0, 'conversation', 'conversations'))

const memorySummary = computed(() => {
  const memories = overview.value?.memories
  if (!memories) return ''
  const pending = memories.pendingProposals > 0 ? ` · ${plural(memories.pendingProposals, 'proposition', 'propositions')} en attente` : ''
  return `${plural(memories.count, 'souvenir', 'souvenirs')}${pending}`
})

const journalSummary = computed(() => {
  const journal = overview.value?.journal
  if (!journal?.latestEntryDate) return 'Aucune entrée pour le moment'
  return `${plural(journal.count, 'entrée', 'entrées')} · dernière le ${formatLongDate(journal.latestEntryDate)}`
})

const privacySummary = computed(() => {
  const consents = overview.value?.consents
  if (!consents) return ''
  return consents.persistentMemory === 'granted' ? 'Mémoire activée · vos accords et vos données' : 'Mémoire désactivée · vos accords et vos données'
})

onMounted(loadOverview)
</script>

<style scoped lang="scss">
.dashboard {
  &__onboarding {
    margin-bottom: var(--space-5);
    background: var(--color-blush);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-4);
  }

  &__resume {
    margin-top: var(--space-6);
  }
}
</style>
