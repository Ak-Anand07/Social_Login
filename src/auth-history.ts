import type { Application } from './declarations'

type AuthUser = {
  id?: number
  name?: string | null
  email?: string | null
}

type AuthResult = {
  accessToken?: string
  authentication?: {
    strategy?: string
  }
  user?: AuthUser
}

type AuthParams = {
  authentication?: {
    accessToken?: string
  }
}

const tableName = 'auth_sessions'

export const configureAuthHistory = (app: Application) => {
  app.on('login', async (authResult: AuthResult) => {
    const user = authResult.user
    const accessToken = authResult.accessToken

    if (!user?.id || !accessToken) {
      return
    }

    const now = new Date().toISOString()

    await app.get('sqliteClient')(tableName)
      .insert({
        userId: user.id,
        provider: authResult.authentication?.strategy ?? 'unknown',
        name: user.name ?? null,
        email: user.email ?? null,
        sessionToken: accessToken,
        loginAt: now,
        logoutAt: null,
        createdAt: now,
        updatedAt: now
      })
      .onConflict('sessionToken')
      .ignore()
  })

  app.on('logout', async (_authResult: AuthResult, params: AuthParams) => {
    const accessToken = params.authentication?.accessToken

    if (!accessToken) {
      return
    }

    const now = new Date().toISOString()

    await app.get('sqliteClient')(tableName)
      .where({ sessionToken: accessToken })
      .andWhere('logoutAt', null)
      .update({
        logoutAt: now,
        updatedAt: now
      })
  })
}
