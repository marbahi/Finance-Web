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
  const { default: transactionsRouter } = await import('../../src/routes/transactions.js')
  app.use('/api/wallets', walletsRouter)
  app.use('/api/transactions', transactionsRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Transactions API', () => {
  let walletId, walletName
  let txId

  it('GET /api/transactions returns list', async () => {
    const res = await request(app).get('/api/transactions')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/transactions filters by type', async () => {
    const res = await request(app).get('/api/transactions?type=expense')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/transactions filters by month & year', async () => {
    const res = await request(app).get('/api/transactions?month=7&year=2026')
    expect(res.status).toBe(200)
  })

  it('GET /api/transactions/:id returns 404', async () => {
    const res = await request(app).get('/api/transactions/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/transactions creates expense and updates wallet balance', async () => {
    const wallets = await request(app).get('/api/wallets')
    const first = wallets.body[0]
    walletId = first.id
    walletName = first.name
    expect(walletId).toBeDefined()

    const w = await request(app).get(`/api/wallets/${walletId}`)
    const balanceBefore = w.body.balance

    const res = await request(app)
      .post('/api/transactions')
      .send({ date: '2026-07-15', note: 'Test expense', type: 'expense', amount: 50000, wallet: walletName })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('expense')
    expect(res.body.amount).toBe(50000)
    txId = res.body.id

    const w2 = await request(app).get(`/api/wallets/${walletId}`)
    expect(w2.body.balance).toBe(balanceBefore - 50000)
  })

  it('POST /api/transactions creates income', async () => {
    const w = await request(app).get(`/api/wallets/${walletId}`)
    const balanceBefore = w.body.balance

    const res = await request(app)
      .post('/api/transactions')
      .send({ date: '2026-07-15', note: 'Gaji', type: 'income', amount: 1000000, wallet: walletName })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('income')

    const w2 = await request(app).get(`/api/wallets/${walletId}`)
    expect(w2.body.balance).toBe(balanceBefore + 1000000)
  })

  it('PUT /api/transactions/:id updates transaction and corrects balance', async () => {
    const w = await request(app).get(`/api/wallets/${walletId}`)
    const balanceBefore = w.body.balance

    const res = await request(app)
      .put(`/api/transactions/${txId}`)
      .send({ note: 'Updated note', amount: 75000 })
    expect(res.status).toBe(200)
    expect(res.body.note).toBe('Updated note')
    expect(res.body.amount).toBe(75000)

    const w2 = await request(app).get(`/api/wallets/${walletId}`)
    expect(w2.body.balance).toBe(balanceBefore - 25000)
  })

  it('DELETE /api/transactions/:id reverts wallet balance', async () => {
    const w = await request(app).get(`/api/wallets/${walletId}`)
    const balanceBefore = w.body.balance

    const res = await request(app).delete(`/api/transactions/${txId}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const w2 = await request(app).get(`/api/wallets/${walletId}`)
    expect(w2.body.balance).toBe(balanceBefore + 75000)

    const check = await request(app).get(`/api/transactions/${txId}`)
    expect(check.status).toBe(404)
  })
})
