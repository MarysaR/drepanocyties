<template>
  <div class="privacy-page">
    <PageHeader
      title="Confidentialité"
      description="Vos accords, l’export et la suppression de vos données."
    />
    <ConsentSettings />
    <Message severity="info">
      Vos contenus (messages, souvenirs, journal, profil) sont chiffrés avant d’être enregistrés.
      Ce premier prototype n’a pas fait l’objet d’un audit de conformité (RGPD, hébergement de données de santé).
    </Message>
    <DataExportPanel />
    <DataErasurePanel />
  </div>
</template>

<script setup lang="ts">
/**
 * Page Confidentialité : consentements, export et effacement des données.
 */
import Message from 'primevue/message'
import ConsentSettings from '@domains/consent/presentation/components/ConsentSettings.vue'
import DataErasurePanel from '@domains/privacy/presentation/components/DataErasurePanel.vue'
import DataExportPanel from '@domains/privacy/presentation/components/DataExportPanel.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Confidentialité' })
</script>

<style scoped lang="scss">
.privacy-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: var(--reading-width);
}
</style>
