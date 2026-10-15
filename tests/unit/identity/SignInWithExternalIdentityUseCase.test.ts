import { describe, expect, it } from 'vitest'
import { SignInWithExternalIdentityUseCase } from '@domains/identity/application/use-cases/SignInWithExternalIdentityUseCase'
import { RegistrationClosedError } from '@domains/identity/domain/errors'
import { ValidationError } from '@shared/errors/AppError'
import { InMemoryUserRepository } from '../../support/InMemoryUserRepository'

describe('Inscription et connexion', () => {
  it('crée automatiquement un espace vierge à la première connexion', async () => {
    const users = new InMemoryUserRepository()
    const { user, isNewUser } = await new SignInWithExternalIdentityUseCase(users).execute('auth0', 'auth0|abc')
    expect(isNewUser).toBe(true)
    expect(users.users).toEqual([user])
  })

  it('retrouve le même compte aux connexions suivantes', async () => {
    const users = new InMemoryUserRepository()
    const signIn = new SignInWithExternalIdentityUseCase(users)
    const first = await signIn.execute('auth0', 'auth0|abc')
    const second = await signIn.execute('auth0', 'auth0|abc')
    expect(second.isNewUser).toBe(false)
    expect(second.user.id).toBe(first.user.id)
    expect(users.users).toHaveLength(1)
  })

  it('ferme les inscriptions une fois la limite atteinte, sans bloquer les comptes existants', async () => {
    const users = new InMemoryUserRepository()
    const signIn = new SignInWithExternalIdentityUseCase(users, 1)
    await signIn.execute('auth0', 'auth0|proprietaire')
    await expect(signIn.execute('auth0', 'auth0|inconnu')).rejects.toBeInstanceOf(RegistrationClosedError)
    expect((await signIn.execute('auth0', 'auth0|proprietaire')).isNewUser).toBe(false)
    expect(users.users).toHaveLength(1)
  })

  it('refuse toute inscription lorsque la limite est de zéro', async () => {
    await expect(new SignInWithExternalIdentityUseCase(new InMemoryUserRepository(), 0).execute('auth0', 'auth0|abc'))
      .rejects.toBeInstanceOf(RegistrationClosedError)
  })

  it('rejette une identité externe vide', async () => {
    await expect(new SignInWithExternalIdentityUseCase(new InMemoryUserRepository()).execute('auth0', '  ')).rejects.toBeInstanceOf(ValidationError)
  })
})
