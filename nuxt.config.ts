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
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#3b1263' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Drepa' },
      ],
      link: [
        // Les cookies sont transmis au manifeste : indispensable derrière un accès authentifié (port privé Codespaces).
        { rel: 'manifest', href: '/manifest.webmanifest', crossorigin: 'use-credentials' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
    },
  },

  runtimeConfig: {
    oauth: {
      auth0: { clientId: '', clientSecret: '', domain: '', redirectURL: '' },
    },
    session: {
      // Surchargeable par NUXT_SESSION_MAX_AGE (en secondes).
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
