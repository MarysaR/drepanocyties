<template>
  <div>
    <PageHeader
      title="Tableau de bord"
      description="Retrouvez vos conversations, vos souvenirs, votre journal et vos réglages."
    />
    <DashboardOverview />
    <AiUsagePanel />
  </div>
</template>

<script setup lang="ts">
/**
 * Page du tableau de bord.
 */
import AiUsagePanel from '@domains/conversation/presentation/components/AiUsagePanel.vue'
import DashboardOverview from '@domains/dashboard/presentation/components/DashboardOverview.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Tableau de bord' })
</script>
