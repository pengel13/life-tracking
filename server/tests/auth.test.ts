import { describe, test, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../src/index.js'

describe('Auth API', () => {
  test('GET /api/auth/status returns configured: false when no auth exists', async () => {
    const res = await request(app).get('/api/auth/status')
    expect(res.status).toBe(200)
    expect(res.body.configured).toBe(false)
  })

  test('GET /api/auth/status returns configured: true after setup', async () => {
    await request(app).post('/api/auth/setup').send({ password: 'test123' })
    const res = await request(app).get('/api/auth/status')
    expect(res.status).toBe(200)
    expect(res.body.configured).toBe(true)
  })

  test('POST /api/auth/setup creates password and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/setup')
      .send({ password: 'test123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe('string')
  })

  test('POST /api/auth/setup returns 409 if already set up', async () => {
    await request(app).post('/api/auth/setup').send({ password: 'test123' })
    const res = await request(app).post('/api/auth/setup').send({ password: 'other' })
    expect(res.status).toBe(409)
  })

  test('POST /api/auth/login with correct password returns token', async () => {
    await request(app).post('/api/auth/setup').send({ password: 'test123' })
    const res = await request(app).post('/api/auth/login').send({ password: 'test123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('POST /api/auth/login with wrong password returns 401', async () => {
    await request(app).post('/api/auth/setup').send({ password: 'test123' })
    const res = await request(app).post('/api/auth/login').send({ password: 'wrong' })
    expect(res.status).toBe(401)
  })

  test('requireAuth rejects missing token with 401', async () => {
    const res = await request(app).get('/api/cards')
    expect(res.status).toBe(401)
  })

  test('requireAuth rejects expired token with 401', async () => {
    const expired = jwt.sign({ id: 'singleton' }, process.env.JWT_SECRET!, { expiresIn: -1 })
    const res = await request(app)
      .get('/api/cards')
      .set('Authorization', `Bearer ${expired}`)
    expect(res.status).toBe(401)
  })
})
