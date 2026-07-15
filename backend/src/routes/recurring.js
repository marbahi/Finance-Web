import { Router } from 'express'
import db from '../db.js'

const router = Router()

const RECUR_TYPES = { 0: 'expense', 1: 'income', 2: 'transfer' }
const FREQ_TYPES = { 1: 'daily', 2: 'weekly', 3: 'monthly', 4: 'yearly' }

function transform(r) {
  const cat = db.prepare('SELECT name FROM category WHERE id = ?').get(r.category_id)
  const wallet = db.prepare('SELECT name FROM wallet WHERE id = ?').get(r.wallet_id)
  return {
    id: r.id,
    name: r.note || '',
    type: RECUR_TYPES[r.type] || 'expense',
    amount: Math.abs(r.amount) / 100,
    category: cat ? cat.name : '',
    category_id: r.category_id,
    wallet: wallet ? wallet.name : '',
    wallet_id: r.wallet_id,
    frequency: FREQ_TYPES[r.recurring_type] || 'monthly',
    nextDate: r.date_time ? new Date(r.date_time).toISOString().slice(0, 10) : '',
    status: r.is_future ? 'active' : 'paused',
    note: r.memo || '',
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM recurring ORDER BY id').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM recurring WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Recurring not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, type, amount, category, category_id, wallet, wallet_id, frequency, nextDate, note } = req.body
  const typeNum = Object.keys(RECUR_TYPES).find(k => RECUR_TYPES[k] === type) || 0
  const freqNum = Object.keys(FREQ_TYPES).find(k => FREQ_TYPES[k] === frequency) || 3
  const catId = category_id || (category ? db.prepare('SELECT id FROM category WHERE name = ?').get(category)?.id : 0) || 0
  const wId = wallet_id || (wallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet)?.id : 0) || 0
  const dateTime = nextDate ? new Date(nextDate).getTime() : Date.now()

  const info = db.prepare(`INSERT INTO recurring (note, memo, type, recurring_type, repeat_type, repeat_date,
    increment, amount, date_time, until_time, last_update_time, account_id, category_id, wallet_id,
    subcategory_id, transfer_wallet_id, trans_amount, is_future)
    VALUES (?, ?, ?, ?, 0, '', 0, ?, ?, 0, ?, 1, ?, ?, 0, 0, 0, 1)`).run(
    name || '', note || '', Number(typeNum), Number(freqNum),
    (Number(amount) || 0) * 100, dateTime, dateTime,
    catId, wId
  )

  const row = db.prepare('SELECT * FROM recurring WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM recurring WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Recurring not found' })

  const { name, type, amount, category, category_id, wallet, wallet_id, frequency, nextDate, note, status } = req.body

  const typeNum = type ? (Object.keys(RECUR_TYPES).find(k => RECUR_TYPES[k] === type) || existing.type) : existing.type
  const freqNum = frequency ? (Object.keys(FREQ_TYPES).find(k => FREQ_TYPES[k] === frequency) || existing.recurring_type) : existing.recurring_type
  const catId = category_id !== undefined ? Number(category_id) : (category ? db.prepare('SELECT id FROM category WHERE name = ?').get(category)?.id ?? existing.category_id : existing.category_id)
  const wId = wallet_id !== undefined ? Number(wallet_id) : (wallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet)?.id ?? existing.wallet_id : existing.wallet_id)

  db.prepare(`UPDATE recurring SET note=?, memo=?, type=?, recurring_type=?, amount=?, date_time=?,
    category_id=?, wallet_id=?, is_future=? WHERE id=?`).run(
    name ?? existing.note,
    note ?? existing.memo,
    Number(typeNum), Number(freqNum),
    amount !== undefined ? Number(amount) * 100 : existing.amount,
    nextDate !== undefined ? (nextDate ? new Date(nextDate).getTime() : existing.date_time) : existing.date_time,
    catId, wId,
    status !== undefined ? (status === 'active' ? 1 : 0) : existing.is_future,
    req.params.id
  )

  const row = db.prepare('SELECT * FROM recurring WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM recurring WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

router.patch('/:id/toggle', (req, res) => {
  const existing = db.prepare('SELECT * FROM recurring WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Recurring not found' })

  db.prepare('UPDATE recurring SET is_future = CASE WHEN is_future = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id)

  const row = db.prepare('SELECT * FROM recurring WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

export default router
