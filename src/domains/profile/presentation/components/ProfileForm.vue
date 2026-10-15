<template>
  <form
    class="profile-form card"
    novalidate
    @submit.prevent="saveProfile"
  >
    <div class="form-field">
      <label for="profile-preferred-name">Comment souhaitez-vous être appelé·e ?</label>
      <InputText
        id="profile-preferred-name"
        v-model="form.preferredName"
        maxlength="60"
        autocomplete="nickname"
      />
    </div>

    <div class="form-field">
      <label for="profile-about-me">Ce que vous aimeriez que le jumeau sache de vous (facultatif)</label>
      <p
        id="profile-about-me-hint"
        class="form-field__hint"
      >
        Vos passions, ce qui vous fait du bien… Vous choisissez ce que vous partagez.
      </p>
      <Textarea
        id="profile-about-me"
        v-model="form.aboutMe"
        maxlength="1000"
        rows="4"
        aria-describedby="profile-about-me-hint"
      />
    </div>

    <fieldset class="form-field">
      <legend>Longueur des réponses du jumeau</legend>
      <div
        v-for="option in replyLengthOptions"
        :key="option.value"
        class="choice-row"
      >
        <RadioButton
          v-model="form.replyLength"
          :input-id="`reply-length-${option.value}`"
          name="replyLength"
          :value="option.value"
        />
        <label :for="`reply-length-${option.value}`">{{ option.label }}</label>
      </div>
    </fieldset>

    <AppErrorMessage :error="error" />
    <Button
      type="submit"
      label="Enregistrer"
      :loading="isSaving"
    />
  </form>
</template>

<script setup lang="ts">
/**
 * Formulaire du profil personnel et des préférences de conversation.
 */
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import { onMounted } from 'vue'
import AppErrorMessage from '@shared/presentation/components/AppErrorMessage.vue'
import { useProfile } from '../composables/useProfile'

const { form, loadProfile, saveProfile, isSaving, error } = useProfile()

const replyLengthOptions = [
  { value: 'SHORT', label: 'Courtes' },
  { value: 'BALANCED', label: 'Mesurées' },
  { value: 'DETAILED', label: 'Développées' },
] as const

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.profile-form {
  max-width: var(--reading-width);
}
</style>
