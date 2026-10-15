import { describe, expect, it } from 'vitest'
import { composeTwinInstructions } from '@domains/conversation/domain/services/TwinInstructionsComposer'

const baseContext = {
  profile: { preferredName: null, aboutMe: null, replyLength: 'BALANCED' as const },
  memories: [],
  canSuggestMemories: false,
}

describe('Instructions du jumeau', () => {
  it('rappelle les principes fondamentaux et les limites', () => {
    const instructions = composeTwinInstructions(baseContext)
    expect(instructions).toMatch(/présent avant d'être utile/i)
    expect(instructions).toMatch(/sans exiger de preuve/i)
    expect(instructions).toMatch(/jamais inventer de souvenirs/i)
    expect(instructions).toMatch(/diagnostic/i)
    expect(instructions).toContain('15')
    expect(instructions).toContain('3114')
  })

  it('déclare honnêtement l’absence de souvenirs', () => {
    expect(composeTwinInstructions(baseContext)).toMatch(/aucun souvenir/i)
  })

  it('présente les souvenirs autorisés comme des données délimitées', () => {
    const instructions = composeTwinInstructions({ ...baseContext, memories: ['Mary aime le jazz.'] })
    expect(instructions).toContain('<souvenirs_autorises>')
    expect(instructions).toContain('- Mary aime le jazz.')
  })

  it("n'évoque l'outil de proposition que lorsque la mémoire est autorisée", () => {
    expect(composeTwinInstructions(baseContext)).not.toContain('propose_memory')
    expect(composeTwinInstructions({ ...baseContext, canSuggestMemories: true })).toContain('propose_memory')
  })

  it('utilise le prénom choisi et la longueur de réponse souhaitée', () => {
    const instructions = composeTwinInstructions({ ...baseContext, profile: { preferredName: 'Mary', aboutMe: 'Je chante.', replyLength: 'SHORT' } })
    expect(instructions).toContain('Mary')
    expect(instructions).toContain('Je chante.')
    expect(instructions).toMatch(/brèves/i)
  })
})
