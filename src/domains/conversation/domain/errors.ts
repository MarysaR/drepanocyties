/**
 * Erreurs métier propres aux conversations.
 */
import { DomainError } from '@shared/errors/AppError'

export class AiBudgetExhaustedError extends DomainError {
  constructor() {
    super('AI_BUDGET_EXHAUSTED', 'Le plafond de consommation de l’IA configuré pour cet espace est atteint : plus aucun message n’est envoyé au fournisseur. Il peut être relevé dans la configuration du serveur.')
  }
}
