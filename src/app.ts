// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import express, {
  rest,
  json,
  urlencoded,
  cors,
  notFound,
  errorHandler
} from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'


import type { Application } from './declarations'
import { configurationValidator } from './configuration'
import { logger } from './logger'
import { logError } from './hooks/log-error'
import { sqlite } from './sqlite'
import { services } from './services/index'
import { channels } from './channels'
import { authentication } from './authentication'
import { configureAuthHistory } from './auth-history'

const app: Application = express(feathers())

// Load app configuration
app.configure(configuration(configurationValidator))
app.use(cors({ origin: app.get('origins') }))
app.use(json())
app.use(urlencoded({ extended: true }))

app.use('/', (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    res.json({
      name: 'feathers-auth-app',
      message: 'API server is running',
      frontendUrl: 'http://localhost:3000'
    })
    return
  }

  next()
})

// Configure services and real-time functionality
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(sqlite)
app.configure(services)
app.configure(channels)
app.configure(authentication)
configureAuthHistory(app)

// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
