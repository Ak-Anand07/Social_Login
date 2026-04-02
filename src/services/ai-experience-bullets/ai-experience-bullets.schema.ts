import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { AiExperienceBulletsService } from './ai-experience-bullets.class'

export const aiExperienceBulletsResultSchema = Type.Object(
  {
    results: Type.Array(Type.String()),
    model: Type.String(),
  },
  { $id: 'AiExperienceBulletsResult', additionalProperties: false },
)

export type AiExperienceBulletsResult = Static<typeof aiExperienceBulletsResultSchema>
export const aiExperienceBulletsResultValidator = getValidator(aiExperienceBulletsResultSchema, dataValidator)

export const aiExperienceBulletsDataSchema = Type.Object(
  {
    jobTitle: Type.Optional(Type.String()),
    summary: Type.Optional(Type.String()),
    company: Type.Optional(Type.String()),
    role: Type.Optional(Type.String()),
    currentDescription: Type.Optional(Type.String()),
    extraContext: Type.Optional(Type.String()),
  },
  { $id: 'AiExperienceBulletsData', additionalProperties: false },
)

export type AiExperienceBulletsData = Static<typeof aiExperienceBulletsDataSchema>
export const aiExperienceBulletsDataValidator = getValidator(aiExperienceBulletsDataSchema, dataValidator)

export const aiExperienceBulletsResultResolver = resolve<AiExperienceBulletsResult, HookContext<AiExperienceBulletsService>>({})
export const aiExperienceBulletsExternalResolver = resolve<AiExperienceBulletsResult, HookContext<AiExperienceBulletsService>>({})
export const aiExperienceBulletsDataResolver = resolve<AiExperienceBulletsData, HookContext<AiExperienceBulletsService>>({
  jobTitle: async (value) => value?.trim() || value,
  summary: async (value) => value?.trim() || value,
  company: async (value) => value?.trim() || value,
  role: async (value) => value?.trim() || value,
  currentDescription: async (value) => value?.trim() || value,
  extraContext: async (value) => value?.trim() || value,
})
