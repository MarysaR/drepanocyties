/**
 * Données fictives partagées par les tests : deux comptes distincts
 * et une horloge contrôlée.
 */
import type { Clock } from '@shared/domain/Clock'
import { toUserId } from '@shared/domain/UserId'
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import { normalizeForFingerprint } from '@shared/infrastructure/crypto/HmacContentFingerprinter'

export const mary = toUserId('00000000-0000-4000-8000-00000000000a')
export const aicha = toUserId('00000000-0000-4000-8000-00000000000b')

export class FixedClock implements Clock {
  constructor(private current = new Date('2026-10-15T09:00:00.000Z')) {}
  now(): Date { return new Date(this.current) }
  advance(milliseconds: number): void { this.current = new Date(this.current.getTime() + milliseconds) }
}

/** Empreinte lisible pour les tests : le contenu normalisé lui-même. */
export const readableFingerprinter: ContentFingerprinter = {
  fingerprint: content => normalizeForFingerprint(content),
}
