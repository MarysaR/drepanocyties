/**
 * Lecture validée des entrées HTTP (corps et paramètres de route).
 */
import { getRouterParam, readBody, type H3Event } from 'h3'
import { z } from 'zod'
import { parseInput } from '@shared/validation/parseInput'

export async function readValidatedInput<Schema extends z.ZodType>(event: H3Event, schema: Schema): Promise<z.output<Schema>> {
  return parseInput(schema, await readBody(event))
}

export function readIdParam(event: H3Event, name = 'id'): string {
  return parseInput(z.uuid('Identifiant invalide.'), getRouterParam(event, name))
}
