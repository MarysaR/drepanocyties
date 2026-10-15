<template>
  <Message
    v-if="error"
    severity="error"
    role="alert"
  >
    {{ message }}
  </Message>
</template>

<script setup lang="ts">
/**
 * Affiche une erreur de façon accessible (role="alert").
 */
import Message from 'primevue/message'
import { computed } from 'vue'
import type { AppError } from '../../errors/AppError'
import { describeError } from '../composables/describeError'

const props = defineProps<{ error: Readonly<AppError> | null }>()

const message = computed(() => (props.error ? describeError(props.error) : ''))
</script>
