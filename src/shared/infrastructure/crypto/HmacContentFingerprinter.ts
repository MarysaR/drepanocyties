/**
 * Empreinte HMAC-SHA256 d'un contenu normalisé (casse, accents, ponctuation, espaces)
 * pour reconnaître un souvenir sans conserver son texte.
 */
import { createHmac } from 'node:crypto'
import type { ContentFingerprinter } from '../../application/ContentProtection'

export class HmacContentFingerprinter implements ContentFingerprinter {
  constructor(private readonly key: Buffer) {}

  fingerprint(content: string): string {
    return createHmac('sha256', this.key).update(normalizeForFingerprint(content)).digest('hex')
  }
}

export function normalizeForFingerprint(content: string): string {
  return content
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
}
