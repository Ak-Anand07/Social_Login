import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { AiResumeStarterService } from './ai-resume-starter.class'

const starterExperienceSchema = Type.Object(
  {
    company: Type.String(),
    role: Type.String(),
    desc: Type.String(),
  },
  { additionalProperties: false },
)

const starterEducationSchema = Type.Object(
  {
    school: Type.String(),
    degree: Type.String(),
    field: Type.String(),
  },
  { additionalProperties: false },
)

const starterAchievementSchema = Type.Object(
  {
    title: Type.String(),
    desc: Type.String(),
  },
  { additionalProperties: false },
)

const starterCertSchema = Type.Object(
  {
    name: Type.String(),
    issuer: Type.String(),
    date: Type.String(),
  },
  { additionalProperties: false },
)

export const aiResumeStarterResultSchema = Type.Object(
  {
    title: Type.String(),
    template: Type.String(),
    jobTitle: Type.String(),
    summary: Type.String(),
    skills: Type.Array(Type.String()),
    strengths: Type.Array(Type.String()),
    hobbies: Type.Array(Type.String()),
    experiences: Type.Array(starterExperienceSchema),
    educations: Type.Array(starterEducationSchema),
    achievements: Type.Array(starterAchievementSchema),
    certs: Type.Array(starterCertSchema),
    model: Type.String(),
  },
  { $id: 'AiResumeStarterResult', additionalProperties: false },
)

export type AiResumeStarterResult = Static<typeof aiResumeStarterResultSchema>
export const aiResumeStarterResultValidator = getValidator(aiResumeStarterResultSchema, dataValidator)

export const aiResumeStarterDataSchema = Type.Object(
  {
    prompt: Type.String(),
  },
  { $id: 'AiResumeStarterData', additionalProperties: false },
)

export type AiResumeStarterData = Static<typeof aiResumeStarterDataSchema>
export const aiResumeStarterDataValidator = getValidator(aiResumeStarterDataSchema, dataValidator)

export const aiResumeStarterResultResolver = resolve<AiResumeStarterResult, HookContext<AiResumeStarterService>>({})
export const aiResumeStarterExternalResolver = resolve<AiResumeStarterResult, HookContext<AiResumeStarterService>>({})
export const aiResumeStarterDataResolver = resolve<AiResumeStarterData, HookContext<AiResumeStarterService>>({
  prompt: async (value) => value?.trim() || '',
})
