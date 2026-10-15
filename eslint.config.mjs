// Règles de lint : configuration Nuxt, ordre imposé des blocs Vue
// (template, script, style) et typage strict.
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['src/shared/infrastructure/prisma/generated/**'],
  },
  {
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    },
  },
)
