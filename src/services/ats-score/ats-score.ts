import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import {
  atsScoreDataResolver,
  atsScoreDataValidator,
  atsScoreExternalResolver,
  atsScoreResultResolver,
} from './ats-score.schema'
import { AtsScoreService } from './ats-score.class'
import { atsScoreMethods, atsScorePath } from './ats-score.shared'

export * from './ats-score.class'

export const atsScore = (app: Application) => {
  app.use(atsScorePath, new AtsScoreService(app), {
    methods: atsScoreMethods,
    events: [],
  })

  app.service(atsScorePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(atsScoreExternalResolver),
        schemaHooks.resolveResult(atsScoreResultResolver),
      ],
    },
    before: {
      all: [],
      create: [schemaHooks.validateData(atsScoreDataValidator), schemaHooks.resolveData(atsScoreDataResolver)],
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
    [atsScorePath]: AtsScoreService
  }
}
