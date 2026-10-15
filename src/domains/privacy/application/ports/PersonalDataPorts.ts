/**
 * Contrats de collecte et d'effacement de l'ensemble des données
 * contrôlées par l'application pour une personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { PersonalDataExport } from '../dto/PersonalDataExport'

export interface PersonalDataCollector {
  collect(userId: UserId): Promise<PersonalDataExport>
}

export interface PersonalDataEraser {
  /** Efface le compte et toutes les données liées, de manière transactionnelle. */
  eraseAll(userId: UserId): Promise<void>
}
