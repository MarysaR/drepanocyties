/**
 * Accès au conteneur serveur, construit une seule fois par processus
 * à partir de la configuration validée.
 */
import { createServerContainer, type ServerContainer } from '@composition/createServerContainer'
import { readServerSettings } from '@composition/serverSettings'

let container: ServerContainer | undefined

export function useServerContainer(): ServerContainer {
  container ??= createServerContainer(readServerSettings(process.env))
  return container
}
