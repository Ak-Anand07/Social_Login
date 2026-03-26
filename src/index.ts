import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app
  .listen(port)
  .then(() => {
    logger.info(`Feathers app listening on http://${host}:${port}`)
  })
  .catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Stop the process using that port or run the API with a different PORT value. Example: set PORT=3031 before starting the server.`
      )
      process.exit(1)
    }

    logger.error(error)
    process.exit(1)
  })
