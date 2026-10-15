/**
 * Contrats d'entrée et de sortie de la mémoire.
 */
import { z } from 'zod'
import type { Memory, MemoryOrigin } from '../../domain/entities/Memory'
import type { MemoryProposal } from '../../domain/entities/MemoryProposal'
import { MEMORY_CONTENT_MAX_LENGTH } from '../../domain/value-objects/MemoryContent'

const memoryContent = z.string().trim().min(2, 'Au moins 2 caractères.').max(MEMORY_CONTENT_MAX_LENGTH, `${MEMORY_CONTENT_MAX_LENGTH} caractères maximum.`)

export const createMemorySchema = z.object({
  content: memoryContent,
  sourceMessageId: z.uuid().optional(),
})

export const correctMemorySchema = z.object({ content: memoryContent })

export const acceptMemoryProposalSchema = z.object({ content: memoryContent.optional() })

export type CreateMemoryInput = z.infer<typeof createMemorySchema>

export interface MemoryDto {
  readonly id: string
  readonly content: string
  readonly origin: MemoryOrigin
  readonly sourceMessageId: string | null
  readonly consentedAt: string
  readonly updatedAt: string
}

export interface MemoryProposalDto {
  readonly id: string
  readonly content: string
  readonly sourceMessageId: string | null
  readonly createdAt: string
}

export interface MemoryOverviewDto {
  readonly memoryEnabled: boolean
  readonly memories: MemoryDto[]
  readonly proposals: MemoryProposalDto[]
}

export function toMemoryDto(memory: Memory): MemoryDto {
  return {
    id: memory.id,
    content: memory.content,
    origin: memory.origin,
    sourceMessageId: memory.sourceMessageId,
    consentedAt: memory.consentedAt.toISOString(),
    updatedAt: memory.updatedAt.toISOString(),
  }
}

export function toMemoryProposalDto(proposal: MemoryProposal): MemoryProposalDto {
  return { id: proposal.id, content: proposal.content, sourceMessageId: proposal.sourceMessageId, createdAt: proposal.createdAt.toISOString() }
}
