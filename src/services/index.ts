import { resume } from './resume/resume'
import { user } from './users/users'
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(resume)
  app.configure(user)
}
