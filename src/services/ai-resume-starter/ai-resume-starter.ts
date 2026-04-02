import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import {
  aiResumeStarterDataResolver,
  aiResumeStarterDataValidator,
  aiResumeStarterExternalResolver,
  aiResumeStarterResultResolver,
} from './ai-resume-starter.schema'
import { AiResumeStarterService } from './ai-resume-starter.class'
import { aiResumeStarterMethods, aiResumeStarterPath } from './ai-resume-starter.shared'

export * from './ai-resume-starter.class'
export * from './ai-resume-starter.schema'

export const aiResumeStarter = (app: Application) => {
  app.use(aiResumeStarterPath, new AiResumeStarterService(app), {
    methods: aiResumeStarterMethods,
    events: [],
  })

  app.service(aiResumeStarterPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(aiResumeStarterExternalResolver),
        schemaHooks.resolveResult(aiResumeStarterResultResolver),
      ],
    },
    before: {
      all: [],
      create: [schemaHooks.validateData(aiResumeStarterDataValidator), schemaHooks.resolveData(aiResumeStarterDataResolver)],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [aiResumeStarterPath]: AiResumeStarterService
  }
}
