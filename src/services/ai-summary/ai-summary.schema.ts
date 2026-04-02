import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { AiSummaryService } from './ai-summary.class'

export const aiSummaryResultSchema = Type.Object(
  {
    result: Type.String(),
    model: Type.String(),
  },
  { $id: 'AiSummaryResult', additionalProperties: false },
)

export type AiSummaryResult = Static<typeof aiSummaryResultSchema>
export const aiSummaryResultValidator = getValidator(aiSummaryResultSchema, dataValidator)

export const aiSummaryDataSchema = Type.Object(
  {
    text: Type.String(),
    jobTitle: Type.Optional(Type.String()),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
  },
  { $id: 'AiSummaryData', additionalProperties: false },
)

export type AiSummaryData = Static<typeof aiSummaryDataSchema>
export const aiSummaryDataValidator = getValidator(aiSummaryDataSchema, dataValidator)

export const aiSummaryResultResolver = resolve<AiSummaryResult, HookContext<AiSummaryService>>({})
export const aiSummaryExternalResolver = resolve<AiSummaryResult, HookContext<AiSummaryService>>({})
export const aiSummaryDataResolver = resolve<AiSummaryData, HookContext<AiSummaryService>>({
  text: async (value) => value?.trim() || '',
  jobTitle: async (value) => value?.trim() || value,
  firstName: async (value) => value?.trim() || value,
  lastName: async (value) => value?.trim() || value,
})
