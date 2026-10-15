/**
 * Chiffrement AES-256-GCM des contenus personnels avant stockage.
 * Format : v1.<iv>.<tag>.<données> en base64url.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import type { ContentCipher } from '../../application/ContentProtection'
import { TechnicalError } from '../../errors/AppError'

const VERSION = 'v1'
const IV_LENGTH = 12

export class AesGcmContentCipher implements ContentCipher {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new TechnicalError('INVALID_ENCRYPTION_KEY', { message: 'La clé de chiffrement doit faire 32 octets.' })
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const data = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return [VERSION, iv.toString('base64url'), tag.toString('base64url'), data.toString('base64url')].join('.')
  }

  decrypt(cipherText: string): string {
    const [version, iv, tag, data] = cipherText.split('.')
    if (version !== VERSION || !iv || !tag || data === undefined) {
      throw new TechnicalError('UNREADABLE_ENCRYPTED_CONTENT')
    }
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8')
  }
}
