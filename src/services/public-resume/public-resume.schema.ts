import { resolve } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import type { PublicResumeService } from './public-resume.class'
import { resumeExternalResolver, resumeResolver, type Resume } from '../resume/resume.schema'

export type PublicResume = Resume

export const publicResumeResultResolver = resolve<PublicResume, HookContext<PublicResumeService>>({})
export const publicResumeExternalResolver = resolve<PublicResume, HookContext<PublicResumeService>>({})

export { resumeResolver as publicResumeResumeResolver, resumeExternalResolver as publicResumeResumeExternalResolver }
