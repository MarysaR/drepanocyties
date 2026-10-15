import { describe, expect, it } from 'vitest'
import { readServerSettings } from '@composition/serverSettings'
import { TechnicalError } from '@shared/errors/AppError'

const baseEnvironment = {
  DATABASE_URL: 'postgresql://twin:pwd@localhost:5432/twin',
  NUXT_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
}

describe('Configuration serveur', () => {
  it('désactive le mode test par défaut', () => {
    expect(readServerSettings(baseEnvironment).testMode).toBe(false)
  })

  it('refuse le mode test sur la base de développement ou de production', () => {
    expect(() => readServerSettings({ ...baseEnvironment, NUXT_PUBLIC_TEST_MODE: 'true' })).toThrow(TechnicalError)
  })

  it('refuse le mode test sur une adresse non locale', () => {
    expect(() => readServerSettings({
      ...baseEnvironment,
      DATABASE_URL: 'postgresql://twin:pwd@localhost:5432/twin_e2e',
      NUXT_SITE_URL: 'https://jumeau.example.org',
      NUXT_PUBLIC_TEST_MODE: 'true',
    })).toThrow(TechnicalError)
  })

  it('accepte le mode test en local sur une base dédiée', () => {
    const settings = readServerSettings({ ...baseEnvironment, DATABASE_URL: 'postgresql://twin:pwd@localhost:5432/twin_e2e', NUXT_PUBLIC_TEST_MODE: 'true' })
    expect(settings.testMode).toBe(true)
  })

  it('exige une clé de chiffrement suffisante', () => {
    expect(() => readServerSettings({ ...baseEnvironment, NUXT_DATA_ENCRYPTION_KEY: 'court' })).toThrow(TechnicalError)
  })

  it("n'active aucun modèle d'IA sans clé (pas de réponse simulée hors mode test)", () => {
    expect(readServerSettings(baseEnvironment).anthropic).toBeUndefined()
  })

  it('utilise Claude Sonnet 5.5 par défaut et ne bascule sur aucun autre modèle', () => {
    const settings = readServerSettings({ ...baseEnvironment, NUXT_ANTHROPIC_API_KEY: 'cle-de-test' })
    expect(settings.anthropic?.model).toBe('claude-sonnet-5-5')
  })

  it('borne la sortie du modèle et fixe un plafond de consommation par défaut', () => {
    const settings = readServerSettings(baseEnvironment)
    expect(settings.aiBudget.limitMicroUsd).toBe(12_000_000)
    expect(settings.aiBudget.prices).toMatchObject({ inputPerMillion: 2, outputPerMillion: 10 })
    expect(settings.rateLimits.perDay).toBe(100)
    expect(() => readServerSettings({ ...baseEnvironment, NUXT_ANTHROPIC_MAX_OUTPUT_TOKENS: '100000' })).toThrow(TechnicalError)
  })

  it('lit la limite d’inscriptions (illimitée si absente)', () => {
    expect(readServerSettings(baseEnvironment).registrationLimit).toBeUndefined()
    expect(readServerSettings({ ...baseEnvironment, NUXT_REGISTRATION_LIMIT: '1' }).registrationLimit).toBe(1)
    expect(readServerSettings({ ...baseEnvironment, NUXT_REGISTRATION_LIMIT: '' }).registrationLimit).toBeUndefined()
    expect(() => readServerSettings({ ...baseEnvironment, NUXT_REGISTRATION_LIMIT: '-2' })).toThrow(TechnicalError)
  })
})
