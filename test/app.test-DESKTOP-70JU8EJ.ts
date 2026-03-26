// For more information about this file see https://dove.feathersjs.com/guides/cli/app.test.html
import assert from 'assert'
import axios from 'axios'
import type { Server } from 'http'
import { app } from '../src/app'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`

describe('Feathers application tests', () => {
  let server: Server

  before(async () => {
    server = await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('starts and shows the API status response', async () => {
    const { data } = await axios.get<{ name: string; message: string; frontendUrl: string }>(appUrl)

    assert.strictEqual(data.name, 'feathers-auth-app')
    assert.strictEqual(data.message, 'API server is running')
    assert.strictEqual(data.frontendUrl, 'http://localhost:3000')
  })

  it('shows a 404 JSON error', async () => {
    try {
      await axios.get(`${appUrl}/path/to/nowhere`, {
        responseType: 'json'
      })
      assert.fail('should never get here')
    } catch (error: any) {
      const { response } = error
      assert.strictEqual(response?.status, 404)
      assert.strictEqual(response?.data?.code, 404)
      assert.strictEqual(response?.data?.name, 'NotFound')
    }
  })
})
