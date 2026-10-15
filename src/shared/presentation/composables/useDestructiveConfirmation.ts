/**
 * Demande une confirmation explicite avant une action irréversible.
 */
import { useConfirm } from 'primevue/useconfirm'

export function useDestructiveConfirmation() {
  const confirm = useConfirm()

  function confirmDestruction(message: string, acceptLabel = 'Supprimer'): Promise<boolean> {
    return new Promise((resolve) => {
      confirm.require({
        header: 'Confirmation',
        message,
        acceptLabel,
        rejectLabel: 'Annuler',
        acceptProps: { severity: 'danger' },
        rejectProps: { severity: 'secondary', outlined: true },
        accept: () => resolve(true),
        reject: () => resolve(false),
        onHide: () => resolve(false),
      })
    })
  }

  return { confirmDestruction }
}
