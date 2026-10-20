import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../src/index.js'

const db = new PrismaClient()
let token: string

beforeEach(async () => {
  // setup.ts already cleared the db; create fresh auth token each test
  const res = await request(app).post('/api/auth/setup').send({ password: 'test123' })
  token = res.body.token
})

function authed(method: 'get' | 'post' | 'patch' | 'delete', url: string) {
  return request(app)[method](url).set('Authorization', `Bearer ${token}`)
}

describe('Cards API', () => {
  test('POST /api/cards creates a card with defaults', async () => {
    const res = await authed('post', '/api/cards').send({
      areaId: 'job1',
      column: 'To Do',
      title: 'Fix bug',
    })
    expect(res.status).toBe(201)
    expect(res.body.urgency).toBe('medium')
    expect(res.body.completedAt).toBeNull()
    expect(res.body.id).toBeDefined()
  })

  test('GET /api/cards returns cards for area', async () => {
    await authed('post', '/api/cards').send({ areaId: 'job1', column: 'To Do', title: 'Task A' })
    await authed('post', '/api/cards').send({ areaId: 'job2', column: 'To Do', title: 'Task B' })
    const res = await authed('get', '/api/cards?areaId=job1')
    expect(res.status).toBe(200)
    expect(res.body.every((c: { areaId: string }) => c.areaId === 'job1')).toBe(true)
  })

  test('PATCH /api/cards/:id sets completedAt when column becomes Done', async () => {
    const card = (await authed('post', '/api/cards').send({ areaId: 'job1', column: 'To Do', title: 'x' })).body
    const res = await authed('patch', `/api/cards/${card.id}`).send({ column: 'Done' })
    expect(res.status).toBe(200)
    expect(res.body.completedAt).not.toBeNull()
  })

  test('PATCH /api/cards/:id clears completedAt when column leaves Done', async () => {
    const card = (await authed('post', '/api/cards').send({ areaId: 'job1', column: 'Done', title: 'x' })).body
    // set completedAt first
    await authed('patch', `/api/cards/${card.id}`).send({ column: 'Done' })
    const res = await authed('patch', `/api/cards/${card.id}`).send({ column: 'In Progress' })
    expect(res.status).toBe(200)
    expect(res.body.completedAt).toBeNull()
  })

  test('GET /api/cards excludes archived cards (completedAt > 90 days)', async () => {
    const old = await db.card.create({
      data: {
        areaId: 'job1',
        column: 'Done',
        title: 'old archived',
        completedAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000),
      },
    })
    const res = await authed('get', '/api/cards?areaId=job1')
    expect(res.body.find((c: { id: string }) => c.id === old.id)).toBeUndefined()
  })

  test('DELETE /api/cards/:id returns 204', async () => {
    const card = (await authed('post', '/api/cards').send({ areaId: 'job1', column: 'To Do', title: 'x' })).body
    const res = await authed('delete', `/api/cards/${card.id}`)
    expect(res.status).toBe(204)
    // confirm gone
    const check = await authed('get', '/api/cards?areaId=job1')
    expect(check.body.find((c: { id: string }) => c.id === card.id)).toBeUndefined()
  })
})
