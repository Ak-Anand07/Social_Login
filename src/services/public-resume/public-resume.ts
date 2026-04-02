import type { Application } from '../../declarations'
import { PublicResumeService } from './public-resume.class'
import { publicResumePath, publicResumeMethods } from './public-resume.shared'

export * from './public-resume.class'
export * from './public-resume.schema'

export const publicResume = (app: Application) => {
  app.use(publicResumePath, new PublicResumeService(app), {
    methods: publicResumeMethods,
    events: [],
  })

  app.service(publicResumePath).hooks({
    before: {
      all: [],
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
    [publicResumePath]: PublicResumeService
  }
}
