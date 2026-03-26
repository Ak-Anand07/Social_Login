import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { oauth, OAuthStrategy } from '@feathersjs/authentication-oauth'
import { NotAuthenticated } from '@feathersjs/errors'
type OAuthProfile = Record<string, any>
import type { Params } from '@feathersjs/feathers'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

class SocialOAuthStrategy extends OAuthStrategy {
  protected getProfileId(profile: OAuthProfile): string | undefined {
    console.log('--- OAUTH PROFILE (getProfileId) ---', JSON.stringify(profile, null, 2))

    // Try all common locations for the provider's user ID
    let providerId =
      profile.sub ||          // OpenID Connect standard (LinkedIn OIDC, Google)
      profile.id ||           // Passport/X standard
      profile.id_str ||       // Twitter v1 API (returns id as string)
      profile.userId ||       // Some LinkedIn strategies
      profile.localizedFirstName // fallback marker (should not be used as ID)

    // Check inside _json (passport-linkedin-oauth2 style)
    if (!providerId && profile._json) {
      providerId =
        profile._json.sub ||
        profile._json.id
    }

    // Reset if we accidentally grabbed a non-ID field
    if (providerId === profile.localizedFirstName) {
      providerId = undefined
    }

    console.log(`--- Extracted Provider ID: ${providerId} ---`)
    return providerId == null ? undefined : String(providerId)
  }

  protected getProfileName(profile: OAuthProfile): string | null {
    console.log('--- OAUTH PROFILE (getProfileName) ---', JSON.stringify(profile, null, 2))
    const givenName = profile.name?.givenName || profile.given_name
    const familyName = profile.name?.familyName || profile.family_name
    const fullName = [givenName, familyName].filter(Boolean).join(' ').trim()
    const finalName = profile.displayName || profile.name || fullName || profile.username || null
    console.log(`--- Extracted Profile Name: ${finalName} ---`)
    return finalName
  }

  protected getProfileAvatar(profile: OAuthProfile): string | null {
    console.log('--- OAUTH PROFILE (getProfileAvatar) ---', JSON.stringify(profile, null, 2))
    const finalAvatar =
      profile.photos?.[0]?.value ||
      profile.picture ||
      profile.avatar_url ||
      profile.profile_image_url ||   // X/Twitter API v2
      null
    console.log(`--- Extracted Profile Avatar: ${finalAvatar} ---`)
    return finalAvatar
  }

  async getEntityQuery(profile: OAuthProfile, params: Params) {
    const profileId = this.getProfileId(profile)
    console.log(`--- getEntityQuery [${this.name}] profileId=${profileId} ---`)

    if (!profileId) {
      console.error(
        `--- [${this.name}] Could not extract profile ID. Full profile: ---`,
        JSON.stringify(profile, null, 2)
      )
      throw new NotAuthenticated(
        `Could not extract a valid user ID from ${this.name} profile. ` +
        `Expected profile.sub or profile.id to be set.`
      )
    }

    return {
      [`${this.name}Id`]: profileId
    }
  }

  async findEntity(profile: OAuthProfile, params: Params) {
    // Try finding by provider ID first (via getEntityQuery, which throws if ID is missing)
    let existingByProvider: any = null
    try {
      existingByProvider = await super.findEntity(profile, params)
    } catch (err: any) {
      // If getEntityQuery threw (profileId is undefined), re-throw
      if (err instanceof NotAuthenticated) throw err
    }

    if (existingByProvider) {
      return existingByProvider
    }

    // Fallback: find by email
    const email = profile.email || (profile.emails as any)?.[0]?.value
    if (!email) {
      return null
    }

    const result = await this.entityService.find({
      ...params,
      query: { email }
    })
    const [entity = null] = result.data ? result.data : result
    return entity
  }

  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params)
    const profileId = this.getProfileId(profile)
    const email =
      profile.email ||
      (profile.emails as any)?.[0]?.value ||
      'no-email@provided.com'
    const name = existing?.name || this.getProfileName(profile)
    const avatar = existing?.avatar || this.getProfileAvatar(profile)

    return {
      ...baseData,
      name,
      email,
      avatar,
      [`${this.name}Id`]: profileId,
      updatedAt: new Date().toISOString()
    }
  }
}

// Twitter2 strategy: maps twitter2Id → twitterId so we reuse the existing DB column
class Twitter2Strategy extends SocialOAuthStrategy {
  // Override to use 'twitterId' column instead of 'twitter2Id'
  async getEntityQuery(profile: OAuthProfile, params: Params) {
    const profileId = this.getProfileId(profile)
    if (!profileId) {
      throw new NotAuthenticated('Could not extract a valid user ID from X (Twitter) profile.')
    }
    return { twitterId: profileId }
  }

  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    const data = await super.getEntityData(profile, existing, params)
    // Rename twitter2Id → twitterId
    const { twitter2Id, ...rest } = data as any
    return {
      ...rest,
      twitterId: twitter2Id ?? data.twitterId
    }
  }
}

export const authentication = (app: Application) => {
  const auth = new AuthenticationService(app)
  auth.register('jwt', new JWTStrategy())
  auth.register('local', new LocalStrategy())
  auth.register('google', new SocialOAuthStrategy())
  auth.register('github', new SocialOAuthStrategy())
  auth.register('linkedin', new SocialOAuthStrategy())
  auth.register('twitter2', new Twitter2Strategy())
  auth.register('facebook', new SocialOAuthStrategy())

  app.use('authentication', auth)
  app.configure(oauth())
}
