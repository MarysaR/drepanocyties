/** Enregistre un accord ou un retrait de consentement. */
import { recordConsentDecisionSchema } from '@domains/consent/application/dto/ConsentDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.consent.record.execute(userId, await readValidatedInput(event, recordConsentDecisionSchema))
  return container.consent.states.execute(userId)
})
