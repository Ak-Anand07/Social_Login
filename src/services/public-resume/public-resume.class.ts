import { BadRequest, NotFound } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Resume } from '../resume/resume.schema'

export class PublicResumeService implements ServiceInterface<Resume, never, Params> {
  constructor(private app: Application) {}

  async get(id: Id, _params?: Params): Promise<Resume> {
    const slug = typeof id === 'string' ? id.trim() : ''
    if (!slug) {
      throw new BadRequest('Public resume slug is required.')
    }

    const record = await this.app
      .get('sqliteClient')('resume')
      .select('*')
      .where({ publicSlug: slug, isPublic: true })
      .first()

    if (!record) {
      throw new NotFound('Public resume not found.')
    }

    return {
      ...record,
      data: typeof record.data === 'string' ? safeParseResumeData(record.data) : record.data
    } as Resume
  }

  async create(): Promise<Resume> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId): Promise<Resume> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId): Promise<Resume> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId): Promise<Resume> {
    throw new BadRequest('Method not supported.')
  }
}

const safeParseResumeData = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
