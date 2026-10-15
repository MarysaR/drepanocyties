/**
 * Identifiant interne d'une personne : toute lecture ou écriture
 * de données personnelles est filtrée par cet identifiant.
 */
export type UserId = string & { readonly __brand: 'UserId' }

export function toUserId(value: string): UserId {
  return value as UserId
}
