import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConsentRevocationListener } from '@domains/consent/application/ports/ConsentRevocationListener'
import { CheckConsentUseCase } from '@domains/consent/application/use-cases/CheckConsentUseCase'
import { GetConsentStatesUseCase } from '@domains/consent/application/use-cases/GetConsentStatesUseCase'
import { OutdatedConsentPolicyError, RecordConsentDecisionUseCase } from '@domains/consent/application/use-cases/RecordConsentDecisionUseCase'
import { currentConsentPolicyVersions } from '@domains/consent/domain/services/ConsentPolicy'
import { InMemoryConsentRepository } from '../../support/InMemoryConsentRepository'
import { FixedClock, aicha, mary } from '../../support/fixtures'

describe('Consentement', () => {
  let repository: InMemoryConsentRepository
  let onConsentRevoked: ReturnType<typeof vi.fn<ConsentRevocationListener['onConsentRevoked']>>
  let record: RecordConsentDecisionUseCase
  let check: CheckConsentUseCase

  beforeEach(() => {
    repository = new InMemoryConsentRepository()
    onConsentRevoked = vi.fn<ConsentRevocationListener['onConsentRevoked']>().mockResolvedValue(undefined)
    record = new RecordConsentDecisionUseCase(repository, { onConsentRevoked }, new FixedClock())
    check = new CheckConsentUseCase(repository)
  })

  it("n'est jamais présumé : sans décision, aucun consentement n'est effectif", async () => {
    expect(await check.execute(mary, 'PERSISTENT_MEMORY')).toBe(false)
    expect(await check.execute(mary, 'AI_PROCESSING')).toBe(false)
  })

  it('devient effectif après un accord explicite sur la version en vigueur', async () => {
    await record.execute(mary, { type: 'PERSISTENT_MEMORY', granted: true, policyVersion: currentConsentPolicyVersions.PERSISTENT_MEMORY })
    expect(await check.execute(mary, 'PERSISTENT_MEMORY')).toBe(true)
  })

  it("refuse un accord donné sur un texte qui n'est plus en vigueur", async () => {
    await expect(record.execute(mary, { type: 'AI_PROCESSING', granted: true, policyVersion: '2020-01-v0' }))
      .rejects.toBeInstanceOf(OutdatedConsentPolicyError)
    expect(await check.execute(mary, 'AI_PROCESSING')).toBe(false)
  })

  it('considère obsolète un accord enregistré sur une ancienne version', async () => {
    repository.decisions.push({ userId: mary, type: 'AI_PROCESSING', granted: true, policyVersion: 'old', decidedAt: new Date() })
    const states = await new GetConsentStatesUseCase(repository).execute(mary)
    expect(states.find(s => s.type === 'AI_PROCESSING')?.status).toBe('outdated')
    expect(await check.execute(mary, 'AI_PROCESSING')).toBe(false)
  })

  it('peut être retiré à tout moment et prévient les autres domaines', async () => {
    await record.execute(mary, { type: 'PERSISTENT_MEMORY', granted: true, policyVersion: currentConsentPolicyVersions.PERSISTENT_MEMORY })
    await record.execute(mary, { type: 'PERSISTENT_MEMORY', granted: false, policyVersion: currentConsentPolicyVersions.PERSISTENT_MEMORY })
    expect(await check.execute(mary, 'PERSISTENT_MEMORY')).toBe(false)
    expect(onConsentRevoked).toHaveBeenCalledWith(mary, 'PERSISTENT_MEMORY')
  })

  it("ne s'applique qu'à la personne qui l'a donné", async () => {
    await record.execute(mary, { type: 'PERSISTENT_MEMORY', granted: true, policyVersion: currentConsentPolicyVersions.PERSISTENT_MEMORY })
    expect(await check.execute(aicha, 'PERSISTENT_MEMORY')).toBe(false)
  })
})
