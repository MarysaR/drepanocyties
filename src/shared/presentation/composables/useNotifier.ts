/**
 * Notifications discrètes de confirmation (toast PrimeVue).
 */
import { useToast } from 'primevue/usetoast'

export function useNotifier() {
  const toast = useToast()

  function confirmSuccess(summary: string): void {
    toast.add({ severity: 'success', summary, life: 3500 })
  }

  return { confirmSuccess }
}
