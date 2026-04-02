import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import {
  aiSkillsDataResolver,
  aiSkillsDataValidator,
  aiSkillsExternalResolver,
  aiSkillsResultResolver,
} from './ai-skills.schema'
import { AiSkillsService } from './ai-skills.class'
import { aiSkillsMethods, aiSkillsPath } from './ai-skills.shared'

export * from './ai-skills.class'
export * from './ai-skills.schema'

export const aiSkills = (app: Application) => {
  app.use(aiSkillsPath, new AiSkillsService(app), {
    methods: aiSkillsMethods,
    events: [],
  })

  app.service(aiSkillsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(aiSkillsExternalResolver),
        schemaHooks.resolveResult(aiSkillsResultResolver),
      ],
    },
    before: {
      all: [],
      create: [schemaHooks.validateData(aiSkillsDataValidator), schemaHooks.resolveData(aiSkillsDataResolver)],
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
    [aiSkillsPath]: AiSkillsService
  }
}
