/**
 * Contenu de la session chiffrée : uniquement l'identifiant interne
 * et le fournisseur d'identité, jamais de donnée personnelle.
 */
declare module '#auth-utils' {
  interface User {
    id: string
    provider: 'auth0' | 'test'
  }
}

export {}
