import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ResumeService } from './resume.class'

const resumePayloadSchema = Type.Object({}, { additionalProperties: true })

const parseResumeData = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const resumeSchema = Type.Object(
  {
    id: Type.Number(),
    userId: Type.Optional(Type.Number()),
    title: Type.String(),
    template: Type.String(),
    status: Type.String(),
    text: Type.Optional(Type.String()),
    data: Type.Optional(resumePayloadSchema),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String())
  },
  { $id: 'Resume', additionalProperties: false }
)
export type Resume = Static<typeof resumeSchema>
export const resumeValidator = getValidator(resumeSchema, dataValidator)
export const resumeResolver = resolve<Resume, HookContext<ResumeService>>({
  data: async (value) => parseResumeData(value)
})

export const resumeExternalResolver = resolve<Resume, HookContext<ResumeService>>({
  data: async (value) => parseResumeData(value)
})

export const resumeDataSchema = Type.Object(
  {
    title: Type.Optional(Type.String()),
    template: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    text: Type.Optional(Type.String()),
    data: Type.Optional(resumePayloadSchema)
  },
  { $id: 'ResumeData', additionalProperties: false }
)
export type ResumeData = Static<typeof resumeDataSchema>
export const resumeDataValidator = getValidator(resumeDataSchema, dataValidator)
export const resumeDataResolver = resolve<ResumeData & Partial<Resume>, HookContext<ResumeService>>({
  data: async (value) => (value == null ? value : JSON.stringify(value)),
  userId: async (_value, _data, context) => (context.params as HookContext['params'] & { user?: { id?: number } }).user?.id,
  title: async (value) => value?.trim() || 'Untitled Resume',
  template: async (value) => value?.trim() || 'modern',
  status: async (value) => value?.trim() || 'draft',
  updatedAt: async () => new Date().toISOString(),
  createdAt: async () => new Date().toISOString()
})

export const resumePatchSchema = Type.Partial(resumeSchema, {
  $id: 'ResumePatch'
})
export type ResumePatch = Static<typeof resumePatchSchema>
export const resumePatchValidator = getValidator(resumePatchSchema, dataValidator)
export const resumePatchResolver = resolve<ResumePatch, HookContext<ResumeService>>({
  data: async (value) => (value == null ? value : JSON.stringify(value)),
  updatedAt: async () => new Date().toISOString(),
  title: async (value) => value?.trim() || value,
  template: async (value) => value?.trim() || value,
  status: async (value) => value?.trim() || value
})

export const resumeQueryProperties = Type.Pick(resumeSchema, [
  'id',
  'userId',
  'title',
  'template',
  'status',
  'text',
  'createdAt',
  'updatedAt'
])
export const resumeQuerySchema = Type.Intersect(
  [
    querySyntax(resumeQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ResumeQuery = Static<typeof resumeQuerySchema>
export const resumeQueryValidator = getValidator(resumeQuerySchema, queryValidator)
export const resumeQueryResolver = resolve<ResumeQuery, HookContext<ResumeService>>({})
