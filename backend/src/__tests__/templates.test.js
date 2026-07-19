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
  const { default: templatesRouter } = await import('../../src/routes/templates.js')
  app.use('/api/templates', templatesRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Templates API', () => {
  let templateId

  it('GET /api/templates returns list', async () => {
    const res = await request(app).get('/api/templates')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/templates/:id returns 404', async () => {
    const res = await request(app).get('/api/templates/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/templates creates expense template', async () => {
    const res = await request(app)
      .post('/api/templates')
      .send({ name: 'Bayar Listrik', type: 'expense', amount: 300000, category: 'Listrik' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Bayar Listrik')
    expect(res.body.type).toBe('expense')
    expect(res.body.amount).toBe(300000)
    templateId = res.body.id
  })

  it('POST /api/templates creates another expense template', async () => {
    const res = await request(app)
      .post('/api/templates')
      .send({ name: 'Gaji Bulanan', type: 'expense', amount: 5000000 })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('expense')
  })

  it('GET /api/templates/:id returns created', async () => {
    const res = await request(app).get(`/api/templates/${templateId}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Bayar Listrik')
  })

  it('PUT /api/templates/:id updates', async () => {
    const res = await request(app)
      .put(`/api/templates/${templateId}`)
      .send({ amount: 350000, memo: 'Bulanan' })
    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(350000)
    expect(res.body.memo).toBe('Bulanan')
  })

  it('DELETE /api/templates/:id deletes', async () => {
    const res = await request(app).delete(`/api/templates/${templateId}`)
    expect(res.status).toBe(200)

    const check = await request(app).get(`/api/templates/${templateId}`)
    expect(check.status).toBe(404)
  })
})
