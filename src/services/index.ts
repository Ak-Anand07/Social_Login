import { aiExperienceBullets } from './ai-experience-bullets/ai-experience-bullets'
import { aiResumeStarter } from './ai-resume-starter/ai-resume-starter'
import { atsScore } from './ats-score/ats-score'
import { aiSkills } from './ai-skills/ai-skills'
import { aiSummary } from './ai-summary/ai-summary'
import { publicResume } from './public-resume/public-resume'
import { resume } from './resume/resume'
import { user } from './users/users'
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(aiExperienceBullets)
  app.configure(aiResumeStarter)
  app.configure(atsScore)
  app.configure(aiSkills)
  app.configure(aiSummary)
  app.configure(publicResume)
  app.configure(resume)
  app.configure(user)
}
