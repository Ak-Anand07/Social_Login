import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import {
  aiExperienceBulletsDataResolver,
  aiExperienceBulletsDataValidator,
  aiExperienceBulletsExternalResolver,
  aiExperienceBulletsResultResolver,
} from './ai-experience-bullets.schema'
import { AiExperienceBulletsService } from './ai-experience-bullets.class'
import { aiExperienceBulletsMethods, aiExperienceBulletsPath } from './ai-experience-bullets.shared'

export * from './ai-experience-bullets.class'
export * from './ai-experience-bullets.schema'

export const aiExperienceBullets = (app: Application) => {
  app.use(aiExperienceBulletsPath, new AiExperienceBulletsService(app), {
    methods: aiExperienceBulletsMethods,
    events: [],
  })

  app.service(aiExperienceBulletsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(aiExperienceBulletsExternalResolver),
        schemaHooks.resolveResult(aiExperienceBulletsResultResolver),
      ],
    },
    before: {
      all: [],
      create: [
        schemaHooks.validateData(aiExperienceBulletsDataValidator),
        schemaHooks.resolveData(aiExperienceBulletsDataResolver),
      ],
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
    [aiExperienceBulletsPath]: AiExperienceBulletsService
  }
}
