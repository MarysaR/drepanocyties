/**
 * Textes de consentement présentés à la personne. Toute modification de fond
 * impose d'incrémenter la version dans ConsentPolicy.
 */
import type { ConsentType } from '@domains/consent/domain/value-objects/ConsentType'
import { productIdentity } from '@shared/config/productIdentity'

export interface ConsentText {
  readonly title: string
  readonly paragraphs: readonly string[]
}

export const consentTexts: Record<ConsentType, ConsentText> = {
  AI_PROCESSING: {
    title: `Discuter avec ${productIdentity.twinName}`,
    paragraphs: [
      'Pour vous répondre, vos messages de la conversation en cours, votre profil et les seuls souvenirs que vous avez autorisés sont transmis à un fournisseur d’intelligence artificielle (Anthropic), qui génère la réponse.',
      'Ce traitement est soumis aux conditions de ce fournisseur. Sa conformité aux exigences applicables aux données de santé n’a pas encore été vérifiée : n’y confiez que ce que vous acceptez de partager.',
      'Sans cet accord, vous pouvez utiliser votre journal et gérer vos données, mais pas discuter avec le jumeau. Vous pouvez retirer cet accord à tout moment.',
    ],
  },
  PERSISTENT_MEMORY: {
    title: 'Mémoire d’une conversation à l’autre',
    paragraphs: [
      'Le jumeau peut vous proposer de retenir certaines choses que vous lui dites. Rien n’est retenu sans votre accord explicite, proposition par proposition.',
      'Vous pouvez consulter, corriger ou supprimer chaque souvenir. Un souvenir corrigé ou supprimé ne sera pas reproposé par le jumeau.',
      'Si vous retirez cet accord, vos souvenirs ne sont plus utilisés et les propositions en attente sont abandonnées. Vous pourrez ensuite supprimer vos souvenirs.',
    ],
  },
}
