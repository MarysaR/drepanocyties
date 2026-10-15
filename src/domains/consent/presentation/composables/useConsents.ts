/**
 * État des consentements et actions d'accord ou de retrait.
 */
import { computed, ref } from 'vue'
import type { ConsentStateDto } from '@domains/consent/application/dto/ConsentDto'
import type { ConsentType } from '@domains/consent/domain/value-objects/ConsentType'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { consentApi } from '../api/consentApi'

export function useConsents() {
  const states = ref<ConsentStateDto[]>([])
  const loading = useAsyncAction(consentApi.states)
  const recording = useAsyncAction(consentApi.record)

  async function loadConsents(): Promise<void> {
    const result = await loading.run()
    if (result.ok) states.value = result.value
  }

  async function decide(type: ConsentType, granted: boolean): Promise<void> {
    const policyVersion = states.value.find(state => state.type === type)?.currentPolicyVersion ?? ''
    const result = await recording.run({ type, granted, policyVersion })
    if (result.ok) states.value = result.value
  }

  const isGranted = (type: ConsentType) => states.value.find(state => state.type === type)?.status === 'granted'
  const hasPendingDecision = computed(() => states.value.some(state => state.status === 'not_decided' || state.status === 'outdated'))

  return {
    states,
    loadConsents,
    decide,
    isGranted,
    hasPendingDecision,
    isLoading: loading.isPending,
    isRecording: recording.isPending,
    error: computed(() => loading.error.value ?? recording.error.value),
  }
}
