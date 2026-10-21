import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'

let token: string
beforeEach(async () => {
  const res = await request(app).post('/api/auth/setup').send({ password: 'test123' })
  token = res.body.token
})

function authed(method: 'get' | 'post' | 'delete', url: string) {
  return request(app)[method](url).set('Authorization', `Bearer ${token}`)
}

describe('Sync accounts API', () => {
  test('GET /api/sync/accounts returns empty array when no accounts connected', async () => {
    const res = await authed('get', '/api/sync/accounts')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('DELETE /api/sync/accounts/:id returns 404 for unknown id', async () => {
    const res = await authed('delete', '/api/sync/accounts/nonexistent')
    expect(res.status).toBe(404)
  })
})
