// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  resumeDataValidator,
  resumePatchValidator,
  resumeQueryValidator,
  resumeResolver,
  resumeExternalResolver,
  resumeDataResolver,
  resumePatchResolver,
  resumeQueryResolver
} from './resume.schema'

import type { Application } from '../../declarations'
import { ResumeService, getOptions } from './resume.class'
import { resumePath, resumeMethods } from './resume.shared'

export * from './resume.class'
export * from './resume.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const resume = (app: Application) => {
  // Register our service on the Feathers application
  app.use(resumePath, new ResumeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: resumeMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(resumePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(resumeExternalResolver),
        schemaHooks.resolveResult(resumeResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(resumeQueryValidator), schemaHooks.resolveQuery(resumeQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(resumeDataValidator), schemaHooks.resolveData(resumeDataResolver)],
      patch: [schemaHooks.validateData(resumePatchValidator), schemaHooks.resolveData(resumePatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [resumePath]: ResumeService
  }
}
