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
  const { default: debtsRouter } = await import('../../src/routes/debts.js')
  app.use('/api/debts', debtsRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Debts API', () => {
  let debtId

  it('GET /api/debts returns list', async () => {
    const res = await request(app).get('/api/debts')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/debts/:id returns 404', async () => {
    const res = await request(app).get('/api/debts/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/debts creates a debt', async () => {
    const res = await request(app)
      .post('/api/debts')
      .send({ name: 'Pinjaman Bank', type: 'debt', person: 'Bank ABC', amount: 10000000, dueDate: '2026-12-31' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Pinjaman Bank')
    expect(res.body.type).toBe('debt')
    expect(res.body.amount).toBe(10000000)
    expect(res.body.status).toBe('active')
    debtId = res.body.id
  })

  it('POST /api/debts creates a receivable', async () => {
    const res = await request(app)
      .post('/api/debts')
      .send({ name: 'Piutang Teman', type: 'receivable', person: 'Budi', amount: 2000000 })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('receivable')
  })

  it('GET /api/debts/:id returns created debt', async () => {
    const res = await request(app).get(`/api/debts/${debtId}`)
    expect(res.status).toBe(200)
    expect(res.body.paid).toBe(0)
  })

  it('POST /api/debts/:id/pay records payment (requires wallet)', async () => {
    const res = await request(app)
      .post(`/api/debts/${debtId}/pay`)
      .send({ wallet: 'Nonexistent', amount: 500000 })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('PUT /api/debts/:id updates debt', async () => {
    const res = await request(app)
      .put(`/api/debts/${debtId}`)
      .send({ amount: 12000000, note: 'Updated' })
    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(12000000)
  })

  it('PUT /api/debts/:id toggles status to paid', async () => {
    const res = await request(app)
      .put(`/api/debts/${debtId}`)
      .send({ status: 'paid' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('paid')
  })

  it('DELETE /api/debts/:id deletes debt', async () => {
    const res = await request(app).delete(`/api/debts/${debtId}`)
    expect(res.status).toBe(200)

    const check = await request(app).get(`/api/debts/${debtId}`)
    expect(check.status).toBe(404)
  })
})
