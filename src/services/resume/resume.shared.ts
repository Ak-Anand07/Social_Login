// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Resume, ResumeData, ResumePatch, ResumeQuery, ResumeService } from './resume.class'

export type { Resume, ResumeData, ResumePatch, ResumeQuery }

export type ResumeClientService = Pick<ResumeService<Params<ResumeQuery>>, (typeof resumeMethods)[number]>

export const resumePath = 'resume'

export const resumeMethods: Array<keyof ResumeService> = ['find', 'get', 'create', 'patch', 'remove']

export const resumeClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(resumePath, connection.service(resumePath), {
    methods: resumeMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [resumePath]: ResumeClientService
  }
}
