/**
 * Dérive des clés distinctes (chiffrement, empreinte) depuis la clé maîtresse
 * fournie par l'environnement, via HKDF.
 */
import { hkdfSync } from 'node:crypto'

export interface DerivedKeys {
  readonly encryptionKey: Buffer
  readonly fingerprintKey: Buffer
}

export function deriveKeys(masterKeyBase64: string): DerivedKeys {
  const master = Buffer.from(masterKeyBase64, 'base64')
  const derive = (info: string) => Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), info, 32))
  return {
    encryptionKey: derive('twin/content-encryption/v1'),
    fingerprintKey: derive('twin/content-fingerprint/v1'),
  }
}
