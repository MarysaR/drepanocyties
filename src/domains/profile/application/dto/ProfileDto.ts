/**
 * Contrats d'entrée et de sortie du profil.
 */
import { z } from 'zod'
import { replyLengths, type ReplyLength } from '../../domain/value-objects/ReplyLength'

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} : ${max} caractères maximum.`).transform(value => value || null).nullable()

export const updateProfileSchema = z.object({
  preferredName: optionalText(60, 'Prénom ou surnom'),
  aboutMe: optionalText(1000, 'Présentation'),
  replyLength: z.enum(replyLengths),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export interface ProfileDto {
  readonly preferredName: string | null
  readonly aboutMe: string | null
  readonly replyLength: ReplyLength
}
