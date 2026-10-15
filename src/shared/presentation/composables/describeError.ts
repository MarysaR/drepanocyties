/**
 * Message à afficher pour une erreur : les messages serveur sont déjà sûrs,
 * les défaillances réseau reçoivent un libellé générique.
 */
import type { AppError } from '../../errors/AppError'

export function describeError(error: Readonly<AppError>): string {
  if (error.kind === 'consent_required') {
    return 'Cette action nécessite votre accord. Vous pouvez le donner ou le retirer à tout moment dans « Confidentialité ».'
  }
  if (error.kind === 'unauthenticated') return 'Votre session a expiré. Merci de vous reconnecter.'
  if (error.kind === 'technical' && error.code === 'UNEXPECTED_ERROR') {
    return 'Le serveur est momentanément injoignable. Vérifiez votre connexion puis réessayez.'
  }
  return error.message
}
