<template>
  <div>
    <PageHeader
      title="Tableau de bord"
      description="Retrouvez vos conversations, vos souvenirs, votre journal et vos réglages."
    />
    <DashboardOverview />
  </div>
</template>

<script setup lang="ts">
/**
 * Page du tableau de bord.
 */
import DashboardOverview from '@domains/dashboard/presentation/components/DashboardOverview.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Tableau de bord' })
</script>
