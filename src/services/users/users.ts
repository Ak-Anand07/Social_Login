import { hooks as schemaHooks } from '@feathersjs/schema'
import { authenticate } from '@feathersjs/authentication'
import { hooks as authHooks } from '@feathersjs/authentication-local'

import type { Application } from '../../declarations'
import { restrictToCurrentUser } from '../../hooks/restrict-to-current-user'
import { UserService, getOptions } from './users.class'
import {
  userSchema,
  userDataSchema,
  userPatchSchema,
  userQuerySchema,
  userResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
  userValidator,
  userDataValidator,
  userPatchValidator,
  userQueryValidator
} from './users.schema'

export * from './users.class'
export * from './users.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use('users', new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    // You can add additional service event handlers here
    events: []
  })
  // Initialize hooks
  app.service('users').hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(userResolver),
        schemaHooks.resolveResult(userResolver)
      ],
      find: [],
      get: [],
      create: [],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },

    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver)
      ],
      find: [authenticate('jwt'), restrictToCurrentUser],
      get: [authenticate('jwt'), restrictToCurrentUser],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        authHooks.hashPassword('password')
      ],
      patch: [
        authenticate('jwt'),
        restrictToCurrentUser,
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver)
      ],
      remove: [restrictToCurrentUser]
    },
    after: {
      all: [authHooks.protect('password')]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    users: UserService
  }
}
