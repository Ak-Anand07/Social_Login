// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ResumeService } from './resume.class'

// Main data model schema
export const resumeSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Resume', additionalProperties: false }
)
export type Resume = Static<typeof resumeSchema>
export const resumeValidator = getValidator(resumeSchema, dataValidator)
export const resumeResolver = resolve<ResumeQuery, HookContext<ResumeService>>({})

export const resumeExternalResolver = resolve<Resume, HookContext<ResumeService>>({})

// Schema for creating new entries
export const resumeDataSchema = Type.Pick(resumeSchema, ['text'], {
  $id: 'ResumeData'
})
export type ResumeData = Static<typeof resumeDataSchema>
export const resumeDataValidator = getValidator(resumeDataSchema, dataValidator)
export const resumeDataResolver = resolve<ResumeData, HookContext<ResumeService>>({})

// Schema for updating existing entries
export const resumePatchSchema = Type.Partial(resumeSchema, {
  $id: 'ResumePatch'
})
export type ResumePatch = Static<typeof resumePatchSchema>
export const resumePatchValidator = getValidator(resumePatchSchema, dataValidator)
export const resumePatchResolver = resolve<ResumePatch, HookContext<ResumeService>>({})

// Schema for allowed query properties
export const resumeQueryProperties = Type.Pick(resumeSchema, ['id', 'text'])
export const resumeQuerySchema = Type.Intersect(
  [
    querySyntax(resumeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ResumeQuery = Static<typeof resumeQuerySchema>
export const resumeQueryValidator = getValidator(resumeQuerySchema, queryValidator)
export const resumeQueryResolver = resolve<ResumeQuery, HookContext<ResumeService>>({})
