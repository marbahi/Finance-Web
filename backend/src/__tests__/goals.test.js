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
  const { default: goalsRouter } = await import('../../src/routes/goals.js')
  app.use('/api/goals', goalsRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Goals API', () => {
  let goalId

  it('GET /api/goals returns list', async () => {
    const res = await request(app).get('/api/goals')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/goals/:id returns 404', async () => {
    const res = await request(app).get('/api/goals/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/goals creates a goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({ name: 'Beli Rumah', target: 500000000, current: 50000000, deadline: '2028-12-31', color: '#2563eb' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Beli Rumah')
    expect(res.body.target).toBe(500000000)
    expect(res.body.current).toBe(50000000)
    expect(res.body.status).toBe('active')
    goalId = res.body.id
  })

  it('POST /api/goals creates without icon (not stored in DB)', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({ name: 'Liburan', target: 20000000 })
    expect(res.status).toBe(201)
  })

  it('GET /api/goals/:id returns created goal', async () => {
    const res = await request(app).get(`/api/goals/${goalId}`)
    expect(res.status).toBe(200)
    expect(res.body.current).toBe(50000000)
  })

  it('PUT /api/goals/:id updates goal', async () => {
    const res = await request(app)
      .put(`/api/goals/${goalId}`)
      .send({ current: 75000000 })
    expect(res.status).toBe(200)
    expect(res.body.current).toBe(75000000)
  })

  it('PUT /api/goals/:id toggles status to achieved', async () => {
    const res = await request(app)
      .put(`/api/goals/${goalId}`)
      .send({ status: 'achieved' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('achieved')
  })

  it('POST /api/goals/:id/fund requires valid wallet', async () => {
    const res = await request(app)
      .post(`/api/goals/${goalId}/fund`)
      .send({ wallet: 'Nonexistent', amount: 100000 })
    expect(res.status).toBe(400)
  })

  it('DELETE /api/goals/:id deletes goal', async () => {
    const res = await request(app).delete(`/api/goals/${goalId}`)
    expect(res.status).toBe(200)

    const check = await request(app).get(`/api/goals/${goalId}`)
    expect(check.status).toBe(404)
  })
})
