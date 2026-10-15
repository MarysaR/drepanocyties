/**
 * Types de consentement gérés par l'application :
 * traitement par l'IA et mémoire permanente.
 */
export const consentTypes = ['AI_PROCESSING', 'PERSISTENT_MEMORY'] as const

export type ConsentType = (typeof consentTypes)[number]
