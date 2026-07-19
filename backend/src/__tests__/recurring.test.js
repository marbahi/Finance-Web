import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import express from 'express'
import request from 'supertest'
import { copyFileSync, unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const testDbPath = join(__dirname, '..', '..', 'finance.test.db')
const originalDbPath = join(__dirname, '..', '..', 'finance.db')

let app

beforeAll(async () => {
  if (existsSync(originalDbPath)) copyFileSync(originalDbPath, testDbPath)
  process.env.DATABASE_PATH = testDbPath

  app = express()
  app.use(express.json())
  const { default: recurringRouter } = await import('../../src/routes/recurring.js')
  app.use('/api/recurring', recurringRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Recurring API', () => {
  let recurringId

  it('GET /api/recurring returns list', async () => {
    const res = await request(app).get('/api/recurring')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/recurring/:id returns 404', async () => {
    const res = await request(app).get('/api/recurring/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/recurring creates monthly expense', async () => {
    const res = await request(app)
      .post('/api/recurring')
      .send({ name: 'Listrik', type: 'expense', amount: 300000, frequency: 'monthly', category_id: 9 })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Listrik')
    expect(res.body.type).toBe('expense')
    expect(res.body.amount).toBe(300000)
    expect(res.body.frequency).toBe('monthly')
    expect(res.body.status).toBe('active')
    recurringId = res.body.id
  })

  it('POST /api/recurring creates daily income', async () => {
    const res = await request(app)
      .post('/api/recurring')
      .send({ name: 'Jajan Harian', type: 'income', amount: 50000, frequency: 'daily' })
    expect(res.status).toBe(201)
    expect(res.body.frequency).toBe('daily')
  })

  it('GET /api/recurring/:id returns created', async () => {
    const res = await request(app).get(`/api/recurring/${recurringId}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Listrik')
  })

  it('PUT /api/recurring/:id updates', async () => {
    const res = await request(app)
      .put(`/api/recurring/${recurringId}`)
      .send({ amount: 350000 })
    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(350000)
  })

  it('PATCH /api/recurring/:id/toggle toggles status', async () => {
    const res = await request(app).patch(`/api/recurring/${recurringId}/toggle`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('paused')

    const res2 = await request(app).patch(`/api/recurring/${recurringId}/toggle`)
    expect(res2.status).toBe(200)
    expect(res2.body.status).toBe('active')
  })

  it('PATCH /api/recurring/:id/toggle returns 404 for invalid', async () => {
    const res = await request(app).patch('/api/recurring/999999/toggle')
    expect(res.status).toBe(404)
  })

  it('DELETE /api/recurring/:id deletes', async () => {
    const res = await request(app).delete(`/api/recurring/${recurringId}`)
    expect(res.status).toBe(200)

    const check = await request(app).get(`/api/recurring/${recurringId}`)
    expect(check.status).toBe(404)
  })
})
