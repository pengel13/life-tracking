import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import { applyRules } from '../src/lib/rulesEngine.js'
import type { SyncMessage } from '../src/lib/rulesEngine.js'
import { buildCard } from '../src/workers/outlookSync.js'

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

describe('Sync rules API', () => {
  test('GET /api/sync/rules returns empty array when no rules exist', async () => {
    const res = await authed('get', '/api/sync/rules')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('POST /api/sync/rules creates a rule', async () => {
    const res = await authed('post', '/api/sync/rules').send({
      name: 'Work emails',
      source: 'email',
      keyword: 'project',
      areaId: 'job1',
      column: 'To Do',
    })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.name).toBe('Work emails')
    expect(res.body.enabled).toBe(true)
  })

  test('DELETE /api/sync/rules/:id removes a rule', async () => {
    const create = await authed('post', '/api/sync/rules').send({
      name: 'To delete',
      source: 'email',
      areaId: 'job1',
      column: 'To Do',
    })
    const del = await authed('delete', `/api/sync/rules/${create.body.id}`)
    expect(del.status).toBe(204)
    const list = await authed('get', '/api/sync/rules')
    expect(list.body.find((r: { id: string }) => r.id === create.body.id)).toBeUndefined()
  })
})

describe('Rules engine', () => {
  const msg: SyncMessage = {
    externalId: 'msg1',
    source: 'email',
    fromEmail: 'boss@company.com',
    subject: 'Q4 review meeting',
    sourceUrl: 'https://outlook.office.com/m/1',
    accountId: 'acc1',
  }

  test('returns null when no rules match', () => {
    const rules = [
      { source: 'teams', keyword: 'review', areaId: 'job1', column: 'To Do', urgency: 'medium', priority: 0, enabled: true } as any,
    ]
    expect(applyRules(msg, rules)).toBeNull()
  })

  test('matches by keyword (case-insensitive)', () => {
    const rules = [
      { source: 'email', keyword: 'Q4', areaId: 'job1', column: 'To Do', urgency: 'high', priority: 0, enabled: true } as any,
    ]
    expect(applyRules(msg, rules)?.areaId).toBe('job1')
  })

  test('matches by fromEmail (partial)', () => {
    const rules = [
      { source: 'email', fromEmail: 'boss@', areaId: 'job2', column: 'To Do', urgency: 'medium', priority: 0, enabled: true } as any,
    ]
    expect(applyRules(msg, rules)?.areaId).toBe('job2')
  })

  test('higher priority rule wins', () => {
    const rules = [
      { source: 'email', keyword: 'review', areaId: 'job1', column: 'To Do', urgency: 'medium', priority: 0, enabled: true },
      { source: 'email', keyword: 'Q4', areaId: 'university', column: 'To Do', urgency: 'high', priority: 10, enabled: true },
    ] as any[]
    expect(applyRules(msg, rules)?.areaId).toBe('university')
  })

  test('disabled rule is skipped', () => {
    const rules = [
      { source: 'email', keyword: 'Q4', areaId: 'job1', column: 'To Do', urgency: 'medium', priority: 0, enabled: false } as any,
    ]
    expect(applyRules(msg, rules)).toBeNull()
  })
})

describe('Outlook sync', () => {
  test('buildCard maps email fields to Card create input', () => {
    const rule = { areaId: 'job1', column: 'To Do', urgency: 'high' } as any
    const msg: SyncMessage = {
      externalId: 'id1',
      source: 'email',
      fromEmail: 'cfo@co.com',
      subject: 'Budget approved',
      sourceUrl: 'https://outlook.office.com/m/1',
      accountId: 'a1',
    }
    const card = buildCard(msg, rule)
    expect(card.title).toBe('Budget approved')
    expect(card.areaId).toBe('job1')
    expect(card.source).toBe('email')
    expect(card.externalId).toBe('id1')
    expect(card.column).toBe('To Do')
  })
})
