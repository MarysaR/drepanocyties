/**
 * Configuration Nuxt : application monopage (aucun rendu serveur des données sensibles),
 * alias d'architecture, sessions chiffrées et en-têtes de sécurité.
 */
import { fileURLToPath } from 'node:url'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: false,
  devtools: { enabled: false },
  telemetry: false,

  modules: ['nuxt-auth-utils', '@nuxt/eslint'],

  alias: {
    '@domains': fromRoot('./src/domains'),
    '@shared': fromRoot('./src/shared'),
    '@composition': fromRoot('./src/composition'),
  },

  css: ['primeicons/primeicons.css', '~/assets/styles/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [{ name: 'robots', content: 'noindex, nofollow' }],
    },
  },

  runtimeConfig: {
    oauth: {
      auth0: { clientId: '', clientSecret: '', domain: '', redirectURL: '' },
    },
    session: {
      maxAge: 60 * 60 * 8,
      cookie: { sameSite: 'lax' },
    },
    public: {
      testMode: false,
    },
  },

  routeRules: {
    '/**': { headers: securityHeaders },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
  },

  typescript: {
    strict: true,
    tsConfig: {
      include: ['../src/**/*', '../types/**/*.d.ts'],
      exclude: ['../src/**/infrastructure/**', '../src/composition/**'],
    },
  },

  nitro: {
    typescript: {
      tsConfig: {
        include: ['../src/**/*', '../types/**/*.d.ts', '../tests/**/*'],
        exclude: ['../src/**/presentation/**'],
      },
    },
  },

  eslint: {
    config: { stylistic: false },
  },
})
