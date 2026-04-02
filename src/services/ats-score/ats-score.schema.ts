import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { AtsScoreService } from './ats-score.class'

export const atsScoreResultSchema = Type.Object(
  {
    score: Type.Number(),
    keywordMatch: Type.Number(),
    contentScore: Type.Number(),
    formatScore: Type.Number(),
    missingKeywords: Type.Array(Type.String()),
    strengths: Type.Array(Type.String()),
    improvements: Type.Array(Type.String()),
    aiSuggestions: Type.Array(Type.String()),
    keywordUsageTips: Type.Array(Type.String()),
    summarySuggestion: Type.Optional(Type.String()),
  },
  { $id: 'AtsScoreResult', additionalProperties: false },
)

export type AtsScoreResult = Static<typeof atsScoreResultSchema>
export const atsScoreResultValidator = getValidator(atsScoreResultSchema, dataValidator)

export const atsScoreDataSchema = Type.Object(
  {
    jobDescription: Type.Optional(Type.String()),
    jobTitle: Type.Optional(Type.String()),
    summary: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    skills: Type.Optional(Type.Array(Type.String())),
    experiences: Type.Optional(
      Type.Array(
        Type.Object({
          company: Type.Optional(Type.String()),
          role: Type.Optional(Type.String()),
          desc: Type.Optional(Type.String()),
        }),
      ),
    ),
    educations: Type.Optional(
      Type.Array(
        Type.Object({
          school: Type.Optional(Type.String()),
          degree: Type.Optional(Type.String()),
          field: Type.Optional(Type.String()),
        }),
      ),
    ),
  },
  { $id: 'AtsScoreData', additionalProperties: false },
)

export type AtsScoreData = Static<typeof atsScoreDataSchema>
export const atsScoreDataValidator = getValidator(atsScoreDataSchema, dataValidator)

export const atsScoreResultResolver = resolve<AtsScoreResult, HookContext<AtsScoreService>>({})
export const atsScoreExternalResolver = resolve<AtsScoreResult, HookContext<AtsScoreService>>({})
export const atsScoreDataResolver = resolve<AtsScoreData, HookContext<AtsScoreService>>({
  jobDescription: async (value) => value?.trim() || '',
  jobTitle: async (value) => value?.trim() || value,
  summary: async (value) => value?.trim() || value,
  email: async (value) => value?.trim() || value,
  phone: async (value) => value?.trim() || value,
  skills: async (value) => value?.map((item) => item.trim()).filter(Boolean) || value,
  experiences: async (value) => value,
  educations: async (value) => value,
})
