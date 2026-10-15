<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
/**
 * Racine de l'application : mise en page, notifications et confirmations.
 */
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { productIdentity } from '@shared/config/productIdentity'

useHead({ titleTemplate: title => (title ? `${title} · ${productIdentity.productName}` : productIdentity.productName) })
</script>
