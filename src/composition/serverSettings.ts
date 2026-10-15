/**
 * Lecture et validation de la configuration serveur depuis l'environnement.
 * Les secrets ne quittent jamais le serveur.
 */
import { z } from 'zod'
import { TechnicalError } from '@shared/errors/AppError'

const booleanFlag = z.enum(['true', 'false']).default('false').transform(value => value === 'true')

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis.'),
  NUXT_DATA_ENCRYPTION_KEY: z.string().refine(
    value => Buffer.from(value, 'base64').length >= 32,
    'NUXT_DATA_ENCRYPTION_KEY doit être une clé base64 d’au moins 32 octets.',
  ),
  NUXT_SITE_URL: z.url().default('http://localhost:3000'),
  NUXT_ANTHROPIC_API_KEY: z.string().optional().transform(value => value || undefined),
  NUXT_ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5-5'),
  NUXT_ANTHROPIC_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1000).max(64_000).default(8000),
  NUXT_AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(6),
  NUXT_AI_RATE_LIMIT_PER_DAY: z.coerce.number().int().min(1).default(200),
  NUXT_OAUTH_AUTH0_DOMAIN: z.string().optional().transform(value => value || undefined),
  NUXT_OAUTH_AUTH0_CLIENT_ID: z.string().optional().transform(value => value || undefined),
  NUXT_PUBLIC_TEST_MODE: booleanFlag,
})

export interface ServerSettings {
  readonly databaseUrl: string
  readonly dataEncryptionKey: string
  readonly appBaseUrl: string
  readonly anthropic: { apiKey: string; model: string; maxOutputTokens: number } | undefined
  readonly rateLimits: { perMinute: number; perDay: number }
  readonly auth0: { domain: string; clientId: string } | undefined
  /** Mode test : connexion par identifiant de test et modèle simulé, limité à localhost et à une base dédiée. */
  readonly testMode: boolean
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/** Les comptes de test ne doivent jamais être créés dans une base de développement ou de production. */
function isDedicatedTestDatabase(databaseUrl: string): boolean {
  const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '')
  return /(^|_|-)(test|e2e)($|_|-)/.test(databaseName)
}

export function readServerSettings(environment: Record<string, string | undefined>): ServerSettings {
  const parsed = environmentSchema.safeParse(environment)
  if (!parsed.success) {
    const fields = parsed.error.issues.map(issue => issue.path.join('.')).join(', ')
    throw new TechnicalError('INVALID_SERVER_CONFIGURATION', { message: `Configuration serveur invalide : ${fields}.` })
  }
  const env = parsed.data

  if (env.NUXT_PUBLIC_TEST_MODE && !LOCAL_HOSTS.has(new URL(env.NUXT_SITE_URL).hostname)) {
    throw new TechnicalError('TEST_MODE_REFUSED', { message: 'Le mode test n’est autorisé que sur une adresse locale.' })
  }
  if (env.NUXT_PUBLIC_TEST_MODE && !isDedicatedTestDatabase(env.DATABASE_URL)) {
    throw new TechnicalError('TEST_MODE_REFUSED', { message: 'Le mode test exige une base dédiée dont le nom contient « test » ou « e2e ».' })
  }

  return {
    databaseUrl: env.DATABASE_URL,
    dataEncryptionKey: env.NUXT_DATA_ENCRYPTION_KEY,
    appBaseUrl: env.NUXT_SITE_URL,
    anthropic: env.NUXT_ANTHROPIC_API_KEY
      ? { apiKey: env.NUXT_ANTHROPIC_API_KEY, model: env.NUXT_ANTHROPIC_MODEL, maxOutputTokens: env.NUXT_ANTHROPIC_MAX_OUTPUT_TOKENS }
      : undefined,
    rateLimits: { perMinute: env.NUXT_AI_RATE_LIMIT_PER_MINUTE, perDay: env.NUXT_AI_RATE_LIMIT_PER_DAY },
    auth0: env.NUXT_OAUTH_AUTH0_DOMAIN && env.NUXT_OAUTH_AUTH0_CLIENT_ID
      ? { domain: env.NUXT_OAUTH_AUTH0_DOMAIN, clientId: env.NUXT_OAUTH_AUTH0_CLIENT_ID }
      : undefined,
    testMode: env.NUXT_PUBLIC_TEST_MODE,
  }
}
