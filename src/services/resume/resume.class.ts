// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Resume, ResumeData, ResumePatch, ResumeQuery } from './resume.schema'

export type { Resume, ResumeData, ResumePatch, ResumeQuery }

export interface ResumeParams extends KnexAdapterParams<ResumeQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ResumeService<ServiceParams extends Params = ResumeParams> extends KnexService<
  Resume,
  ResumeData,
  ResumeParams,
  ResumePatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'resume'
  }
}
