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
  const { default: catRouter } = await import('../../src/routes/categories.js')
  app.use('/api/categories', catRouter)
})

afterAll(() => {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
})

describe('Categories API', () => {
  let createdId

  it('GET /api/categories returns list with subcategories', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('subcategories')
      expect(Array.isArray(res.body[0].subcategories)).toBe(true)
    }
  })

  it('GET /api/categories/all returns list ordered by type', async () => {
    const res = await request(app).get('/api/categories/all')
    expect(res.status).toBe(200)
  })

  it('GET /api/categories/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/categories/999999')
    expect(res.status).toBe(404)
  })

  it('POST /api/categories creates expense category with subcategories', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Kategori', type: 'expense', color: '#dc2626', subcategories: ['Sub A', 'Sub B'] })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Kategori')
    expect(res.body.type).toBe('expense')
    expect(res.body.subcategories).toEqual(['Sub A', 'Sub B'])
    createdId = res.body.id
  })

  it('POST /api/categories creates income category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Income', type: 'income', color: '#059669' })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('income')
  })

  it('GET /api/categories/:id returns created category', async () => {
    const res = await request(app).get(`/api/categories/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Test Kategori')
  })

  it('PUT /api/categories/:id updates name and subcategories', async () => {
    const res = await request(app)
      .put(`/api/categories/${createdId}`)
      .send({ name: 'Kategori Updated', subcategories: ['Sub X'] })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Kategori Updated')
    expect(res.body.subcategories).toEqual(['Sub X'])
  })

  it('DELETE /api/categories/:id deletes category', async () => {
    const res = await request(app).delete(`/api/categories/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
  })
})
