import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import {
  aiSummaryDataResolver,
  aiSummaryDataValidator,
  aiSummaryExternalResolver,
  aiSummaryResultResolver,
} from './ai-summary.schema'
import { AiSummaryService, getOptions } from './ai-summary.class'
import { aiSummaryMethods, aiSummaryPath } from './ai-summary.shared'

export * from './ai-summary.class'
export * from './ai-summary.schema'

export const aiSummary = (app: Application) => {
  app.use(aiSummaryPath, new AiSummaryService(app), {
    methods: aiSummaryMethods,
    events: [],
  })

  app.service(aiSummaryPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(aiSummaryExternalResolver),
        schemaHooks.resolveResult(aiSummaryResultResolver),
      ],
    },
    before: {
      all: [],
      create: [schemaHooks.validateData(aiSummaryDataValidator), schemaHooks.resolveData(aiSummaryDataResolver)],
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
    [aiSummaryPath]: AiSummaryService
  }
}
