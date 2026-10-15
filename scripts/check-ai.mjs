// Vérifie que la clé API est acceptée et que le modèle configuré existe pour ce compte.
// Appel de métadonnées gratuit (Models API) : aucun token n'est consommé. La clé n'est jamais affichée.
import Anthropic from '@anthropic-ai/sdk'

const model = process.env.NUXT_ANTHROPIC_MODEL || 'claude-sonnet-5-5'
if (!process.env.NUXT_ANTHROPIC_API_KEY) {
  console.error('NUXT_ANTHROPIC_API_KEY est absent de l’environnement.')
  process.exit(1)
}

const client = new Anthropic({ apiKey: process.env.NUXT_ANTHROPIC_API_KEY, maxRetries: 0 })
try {
  const info = await client.models.retrieve(model)
  console.info(`OK : le modèle « ${info.id} » (${info.display_name}) est accessible avec cette clé.`)
  console.info(`Fenêtre de contexte : ${info.max_input_tokens ?? 'inconnue'} tokens · sortie max : ${info.max_tokens ?? 'inconnue'} tokens.`)
}
catch (error) {
  const status = error instanceof Anthropic.APIError ? error.status : undefined
  const causes = { 401: 'clé API invalide ou révoquée', 403: 'accès refusé à ce modèle', 404: 'modèle introuvable pour ce compte' }
  console.error(`ÉCHEC pour le modèle « ${model} » : ${causes[status] ?? `erreur ${status ?? 'réseau'}`}.`)
  process.exit(1)
}
