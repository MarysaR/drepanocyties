/**
 * Contrats de protection des contenus personnels : chiffrement réversible
 * et empreinte non réversible servant à reconnaître un contenu sans le conserver.
 */
export interface ContentCipher {
  encrypt(plainText: string): string
  decrypt(cipherText: string): string
}

export interface ContentFingerprinter {
  fingerprint(content: string): string
}
