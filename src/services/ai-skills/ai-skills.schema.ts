import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { AiSkillsService } from './ai-skills.class'

export const aiSkillsResultSchema = Type.Object(
  {
    results: Type.Array(Type.String()),
    model: Type.String(),
  },
  { $id: 'AiSkillsResult', additionalProperties: false },
)

export type AiSkillsResult = Static<typeof aiSkillsResultSchema>
export const aiSkillsResultValidator = getValidator(aiSkillsResultSchema, dataValidator)

export const aiSkillsDataSchema = Type.Object(
  {
    jobTitle: Type.Optional(Type.String()),
    summary: Type.Optional(Type.String()),
    existingSkills: Type.Optional(Type.Array(Type.String())),
    experienceText: Type.Optional(Type.String()),
  },
  { $id: 'AiSkillsData', additionalProperties: false },
)

export type AiSkillsData = Static<typeof aiSkillsDataSchema>
export const aiSkillsDataValidator = getValidator(aiSkillsDataSchema, dataValidator)

export const aiSkillsResultResolver = resolve<AiSkillsResult, HookContext<AiSkillsService>>({})
export const aiSkillsExternalResolver = resolve<AiSkillsResult, HookContext<AiSkillsService>>({})
export const aiSkillsDataResolver = resolve<AiSkillsData, HookContext<AiSkillsService>>({
  jobTitle: async (value) => value?.trim() || value,
  summary: async (value) => value?.trim() || value,
  existingSkills: async (value) => value?.map((item) => item.trim()).filter(Boolean) || value,
  experienceText: async (value) => value?.trim() || value,
})
