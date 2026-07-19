import { Router } from 'express'
import { generateToken } from '../middleware/auth.js'

const router = Router()

const AUTH_USER = process.env.AUTH_USER || ''
const AUTH_PASS = process.env.AUTH_PASS || ''

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  if (username !== AUTH_USER || password !== AUTH_PASS) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = generateToken({ username })
  res.json({ token, user: { username } })
})

export default router
