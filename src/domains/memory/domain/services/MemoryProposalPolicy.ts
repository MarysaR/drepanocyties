/**
 * Règles encadrant les propositions du jumeau : peu nombreuses,
 * jamais en double et jamais sur un contenu refusé, corrigé ou supprimé.
 */
export const MAX_TWIN_SUGGESTIONS_PER_MESSAGE = 2

export interface ProposalCandidateFacts {
  readonly isSuppressed: boolean
  readonly alreadyRemembered: boolean
  readonly alreadyProposed: boolean
}

export function isTwinProposalAllowed(facts: ProposalCandidateFacts): boolean {
  return !facts.isSuppressed && !facts.alreadyRemembered && !facts.alreadyProposed
}
