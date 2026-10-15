/**
 * Libellés de provenance des souvenirs.
 */
import type { MemoryOrigin } from '@domains/memory/domain/entities/Memory'

export const memoryOriginLabels: Record<MemoryOrigin, string> = {
  TWIN_PROPOSAL: 'Proposé par le jumeau, accepté par vous',
  PERSON_MESSAGE: 'Retenu depuis l’un de vos messages',
  WRITTEN_BY_PERSON: 'Écrit par vous',
}
