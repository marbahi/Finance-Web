import { Router } from 'express'
import db from '../db.js'

const router = Router()

const WALLET_TYPES = { 0: 'bank', 1: 'cash', 2: 'credit', 3: 'ewallet' }
const WALLET_ICONS = { 0: 'Wallet', 1: 'Bank', 2: 'CreditCard', 3: 'PiggyBank' }

function transform(w) {
  return {
    id: w.id,
    name: w.name,
    type: WALLET_TYPES[w.type] || 'bank',
    balance: w.amount / 100,
    initial: w.initial_amount / 100,
    color: w.color || '#2563eb',
    icon: WALLET_ICONS[w.icon] || 'Wallet',
    active: !!w.active,
    exclude: !!w.exclude,
    hidden: !!w.hidden,
    limit: w.credit_limit || 0,
    dueDate: w.due_date ? new Date(w.due_date).toISOString().slice(0, 10) : '',
    statementDate: w.statement_date ? new Date(w.statement_date).toISOString().slice(0, 10) : '',
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM wallet WHERE hidden = 0').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM wallet WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Wallet not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, type, balance, initial, color, active, exclude, limit, dueDate, statementDate } = req.body
  const typeNum = Object.keys(WALLET_TYPES).find(k => WALLET_TYPES[k] === type) || 0
  const info = db.prepare(`INSERT INTO wallet (name, type, amount, initial_amount, color, active, exclude, credit_limit, due_date, statement_date, account_id, ordering, icon, hidden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, 0)`).run(
    name || '', Number(typeNum), (Number(balance) || 0) * 100, (Number(initial) || 0) * 100,
    color || '#2563eb', active ? 1 : 0, exclude ? 1 : 0,
    Number(limit) || 0, dueDate ? new Date(dueDate).getTime() : 0,
    statementDate ? new Date(statementDate).getTime() : 0,
    Number(typeNum)
  )
  const row = db.prepare('SELECT * FROM wallet WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const { name, type, balance, initial, color, active, exclude, limit, dueDate, statementDate } = req.body
  const typeNum = type ? (Object.keys(WALLET_TYPES).find(k => WALLET_TYPES[k] === type) || 0) : undefined
  const existing = db.prepare('SELECT * FROM wallet WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Wallet not found' })

  db.prepare(`UPDATE wallet SET
    name = ?, type = ?, amount = ?, initial_amount = ?, color = ?, active = ?,
    exclude = ?, credit_limit = ?, due_date = ?, statement_date = ?, icon = ?
    WHERE id = ?`).run(
    name ?? existing.name,
    typeNum ?? existing.type,
    balance !== undefined ? Number(balance) * 100 : existing.amount,
    initial !== undefined ? Number(initial) * 100 : existing.initial_amount,
    color ?? existing.color,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    exclude !== undefined ? (exclude ? 1 : 0) : existing.exclude,
    limit !== undefined ? Number(limit) : existing.credit_limit,
    dueDate !== undefined ? (dueDate ? new Date(dueDate).getTime() : 0) : existing.due_date,
    statementDate !== undefined ? (statementDate ? new Date(statementDate).getTime() : 0) : existing.statement_date,
    typeNum ?? existing.icon,
    req.params.id
  )
  const row = db.prepare('SELECT * FROM wallet WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM wallet WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
