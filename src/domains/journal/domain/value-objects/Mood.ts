/**
 * Humeurs proposées dans le journal (facultatives, jamais imposées).
 */
export const moods = ['CALM', 'JOYFUL', 'GRATEFUL', 'TIRED', 'WORRIED', 'SAD', 'ANGRY', 'OVERWHELMED'] as const

export type Mood = (typeof moods)[number]
