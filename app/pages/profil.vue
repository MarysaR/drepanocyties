<template>
  <div>
    <PageHeader
      title="Profil"
      description="Ce que vous choisissez de partager et la manière dont le jumeau vous répond."
    />
    <ProfileForm />
  </div>
</template>

<script setup lang="ts">
/**
 * Page du profil personnel et des préférences.
 */
import ProfileForm from '@domains/profile/presentation/components/ProfileForm.vue'
import PageHeader from '@shared/presentation/components/PageHeader.vue'

useHead({ title: 'Profil' })
</script>
