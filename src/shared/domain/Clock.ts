/**
 * Source du temps injectée, pour des règles métier testables.
 */
export interface Clock {
  now(): Date
}

export const systemClock: Clock = { now: () => new Date() }
