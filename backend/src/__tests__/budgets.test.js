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
  const { default: budgetsRouter } = await import('../../src/routes/budgets.js')
  app.use('/api/budgets', budgetsRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Budgets API', () => {
  let createdId, catId

  it('GET /api/budgets returns list', async () => {
    const res = await request(app).get('/api/budgets')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/budgets filters by month & year', async () => {
    const res = await request(app).get('/api/budgets?month=7&year=2026')
    expect(res.status).toBe(200)
  })

  it('GET /api/budgets/:id returns 404', async () => {
    const res = await request(app).get('/api/budgets/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/budgets creates budget', async () => {
    catId = 9
    const res = await request(app)
      .post('/api/budgets')
      .send({ category_id: catId, amount: 500000, month: 7, year: 2026 })
    expect(res.status).toBe(201)
    expect(res.body.amount).toBe(500000)
    expect(res.body.month).toBe(7)
    expect(res.body.year).toBe(2026)
    createdId = res.body.id
  })

  it('GET /api/budgets/:id returns created budget', async () => {
    const res = await request(app).get(`/api/budgets/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(createdId)
  })

  it('GET /api/budgets with filter returns created budget', async () => {
    const res = await request(app).get('/api/budgets?month=7&year=2026')
    expect(res.status).toBe(200)
    expect(res.body.some(b => b.id === createdId)).toBe(true)
  })

  it('PUT /api/budgets/:id updates budget', async () => {
    const res = await request(app)
      .put(`/api/budgets/${createdId}`)
      .send({ amount: 600000 })
    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(600000)
  })

  it('DELETE /api/budgets/:id deletes budget', async () => {
    const res = await request(app).delete(`/api/budgets/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const check = await request(app).get(`/api/budgets/${createdId}`)
    expect(check.status).toBe(404)
  })
})
