import { Router } from 'express'
import db from '../db.js'

const router = Router()

const TRANS_TYPES = { 0: 'income', 1: 'expense', 2: 'transfer' }

function transform(t) {
  const type = TRANS_TYPES[t.type] || 'expense'
  const wallet = db.prepare('SELECT name FROM wallet WHERE id = ?').get(t.wallet_id)
  const cat = db.prepare('SELECT name FROM category WHERE id = ?').get(t.category_id)
  let transferWallet = ''
  if (t.transfer_wallet_id > 0) {
    const tw = db.prepare('SELECT name FROM wallet WHERE id = ?').get(t.transfer_wallet_id)
    if (tw) transferWallet = tw.name
  }
  const sub = db.prepare('SELECT name FROM subcategory WHERE id = ?').get(t.subcategory_id)

  return {
    id: t.id,
    date: t.date_time ? new Date(t.date_time).toISOString().slice(0, 10) : '',
    note: t.note || '',
    memo: t.memo || '',
    type,
    amount: Math.abs(t.amount) / 100,
    category: cat ? cat.name : '',
    subcategory: sub ? sub.name : '',
    wallet: wallet ? wallet.name : '',
    transferWallet,
  }
}

router.get('/', (req, res) => {
  let query = 'SELECT * FROM trans WHERE 1=1'
  const params = []

  if (req.query.type !== undefined) {
    const typeKeys = Object.keys(TRANS_TYPES)
    const typeNum = typeKeys.find(k => TRANS_TYPES[k] === req.query.type)
    if (typeNum !== undefined) {
      query += ' AND type = ?'
      params.push(Number(typeNum))
    }
  }

  if (req.query.wallet_id) {
    query += ' AND (wallet_id = ? OR transfer_wallet_id = ?)'
    params.push(Number(req.query.wallet_id), Number(req.query.wallet_id))
  }

  if (req.query.category_id) {
    query += ' AND category_id = ?'
    params.push(Number(req.query.category_id))
  }

  if (req.query.month && req.query.year) {
    const start = new Date(Number(req.query.year), Number(req.query.month) - 1, 1).getTime()
    const end = new Date(Number(req.query.year), Number(req.query.month), 0, 23, 59, 59).getTime()
    query += ' AND date_time >= ? AND date_time <= ?'
    params.push(start, end)
  }

  query += ' ORDER BY date_time DESC'

  const rows = db.prepare(query).all(...params)
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trans WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Transaction not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { date, note, memo, type, amount, category, subcategory, wallet, transferWallet } = req.body

  const w = db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet)
  const cat = category ? db.prepare('SELECT id FROM category WHERE name = ?').get(category) : null
  const sub = subcategory ?
    db.prepare('SELECT s.id FROM subcategory s JOIN category c ON c.id = s.category_id WHERE s.name = ?').get(subcategory)
    : null
  const tw = transferWallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(transferWallet) : null

  const typeNum = Object.keys(TRANS_TYPES).find(k => TRANS_TYPES[k] === type) || 1
  const dbAmount = (typeNum === 1 ? -1 : 1) * Math.abs(Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  const info = db.prepare(`INSERT INTO trans (note, memo, type, amount, date_time, account_id, fee_id,
    category_id, subcategory_id, wallet_id, transfer_wallet_id, trans_amount, debt_id, debt_trans_id, budget_id)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, 0, 0, 0, ?)`).run(
    note || '', memo || '', Number(typeNum), dbAmount, dateTime,
    cat ? cat.id : 0, sub ? sub.id : 0, w ? w.id : 0,
    tw ? tw.id : -1, typeNum === 2 ? Math.abs(Number(amount)) : 0,
    req.body.budget_id || null
  )

  const row = db.prepare('SELECT * FROM trans WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM trans WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Transaction not found' })

  const { date, note, memo, type, amount, category, subcategory, wallet, transferWallet } = req.body

  const w = wallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet) : null
  const cat = category ? db.prepare('SELECT id FROM category WHERE name = ?').get(category) : null
  const sub = subcategory !== undefined ?
    (subcategory ? db.prepare('SELECT id FROM subcategory WHERE name = ?').get(subcategory) : null)
    : null
  const tw = transferWallet !== undefined ?
    (transferWallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(transferWallet) : null)
    : null

  const typeNum = type ? (Object.keys(TRANS_TYPES).find(k => TRANS_TYPES[k] === type) || existing.type) : existing.type
  const dbAmount = amount !== undefined
    ? (Number(typeNum) === 1 ? -1 : 1) * Math.abs(Number(amount)) * 100
    : existing.amount
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : existing.date_time

  db.prepare(`UPDATE trans SET note=?, memo=?, type=?, amount=?, date_time=?,
    category_id=?, subcategory_id=?, wallet_id=?, transfer_wallet_id=? WHERE id=?`).run(
    note ?? existing.note, memo ?? existing.memo,
    Number(typeNum), dbAmount, dateTime,
    cat ? cat.id : existing.category_id,
    sub !== null ? (sub ? sub.id : 0) : existing.subcategory_id,
    w ? w.id : existing.wallet_id,
    tw !== null ? (tw ? tw.id : -1) : existing.transfer_wallet_id,
    req.params.id
  )

  const row = db.prepare('SELECT * FROM trans WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM trans WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
