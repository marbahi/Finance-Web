import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'

describe('Health API', () => {
  it('GET /api/health returns ok', async () => {
    const app = express()
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
