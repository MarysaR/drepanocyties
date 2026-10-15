<template>
  <section
    class="card"
    aria-labelledby="data-export-title"
  >
    <h2 id="data-export-title">
      Télécharger mes données
    </h2>
    <p>
      Vous recevez un fichier JSON lisible contenant votre profil, vos conversations, vos souvenirs,
      votre journal et l’historique de vos accords.
    </p>
    <a
      class="ui-button ui-button--secondary"
      :href="exportUrl"
      download
    >
      <span
        class="pi pi-download"
        aria-hidden="true"
      />
      Télécharger l’export
    </a>
  </section>
</template>

<script setup lang="ts">
/**
 * Export des données personnelles (téléchargement direct, session requise).
 */
import { PERSONAL_DATA_EXPORT_URL } from '../api/privacyApi'

const exportUrl = PERSONAL_DATA_EXPORT_URL
</script>
