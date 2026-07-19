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
  const { default: walletsRouter } = await import('../../src/routes/wallets.js')
  app.use('/api/wallets', walletsRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Wallets API', () => {
  let createdId

  it('GET /api/wallets returns list', async () => {
    const res = await request(app).get('/api/wallets')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/wallets/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/wallets/999999')
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('POST /api/wallets creates a cash wallet', async () => {
    const res = await request(app)
      .post('/api/wallets')
      .send({ name: 'Test Cash', balance: 500000, type: 'cash' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('Test Cash')
    expect(res.body.balance).toBe(500000)
    expect(res.body.type).toBe('cash')
    createdId = res.body.id
  })

  it('POST /api/wallets creates a credit card wallet', async () => {
    const res = await request(app)
      .post('/api/wallets')
      .send({ name: 'Test CC', balance: -2000000, type: 'credit', limit: 5000000, dueDate: '2026-08-15' })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('credit')
    expect(res.body.limit).toBe(5000000)
    expect(res.body.dueDate).toBe('2026-08-15')
  })

  it('GET /api/wallets/:id returns created wallet', async () => {
    const res = await request(app).get(`/api/wallets/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Test Cash')
  })

  it('PUT /api/wallets/:id updates wallet', async () => {
    const res = await request(app)
      .put(`/api/wallets/${createdId}`)
      .send({ name: 'Test Cash Updated', balance: 600000 })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Test Cash Updated')
    expect(res.body.balance).toBe(600000)
  })

  it('DELETE /api/wallets/:id deletes wallet', async () => {
    const res = await request(app).delete(`/api/wallets/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const check = await request(app).get(`/api/wallets/${createdId}`)
    expect(check.status).toBe(404)
  })
})
