import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { resolve } from '@feathersjs/schema'
import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

const nullableString = Type.Union([Type.String(), Type.Null()])

export const userSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.Optional(nullableString),
    email: Type.Optional(nullableString),
    avatar: Type.Optional(nullableString),
    password: Type.Optional(nullableString),
    googleId: Type.Optional(nullableString),
    githubId: Type.Optional(nullableString),
    linkedinId: Type.Optional(nullableString),
    twitterId: Type.Optional(nullableString),
    facebookId: Type.Optional(nullableString),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String())
  },
  { $id: 'User', additionalProperties: true }
)
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext>({})

export const userDataSchema = Type.Object(
  {
    name: Type.Optional(nullableString),
    email: Type.Optional(nullableString),
    avatar: Type.Optional(nullableString),
    password: Type.Optional(nullableString),
    googleId: Type.Optional(nullableString),
    githubId: Type.Optional(nullableString),
    linkedinId: Type.Optional(nullableString),
    twitterId: Type.Optional(nullableString),
    facebookId: Type.Optional(nullableString)
  },
  { $id: 'UserData', additionalProperties: true }
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
  createdAt: async () => new Date().toISOString(),
  updatedAt: async () => new Date().toISOString()
})

export const userPatchSchema = Type.Partial(userDataSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext>({
  updatedAt: async () => new Date().toISOString()
})

export const userQueryProperties = Type.Pick(userSchema, [
  'id',
  'name',
  'email',
  'avatar',
  'googleId',
  'githubId',
  'linkedinId',
  'twitterId',
  'facebookId',
  'createdAt',
  'updatedAt'
])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { $id: 'UserQuery', additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({})
