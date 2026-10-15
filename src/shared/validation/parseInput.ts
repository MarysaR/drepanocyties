/**
 * Valide une entrée avec un schéma Zod et lève une ValidationError
 * dont les messages sont sûrs à afficher.
 */
import type { z } from 'zod'
import { ValidationError } from '../errors/AppError'

export function parseInput<Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> {
  const result = schema.safeParse(input)
  if (result.success) return result.data
  throw new ValidationError(
    'Certaines informations sont invalides.',
    result.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })),
  )
}
