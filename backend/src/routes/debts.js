import { Router } from 'express'
import db from '../db.js'

const router = Router()

const DEBT_TYPES = { 0: 'debt', 1: 'receivable' }

function transform(d) {
  const totalPaid = db.prepare('SELECT COALESCE(SUM(amount), 0) AS paid FROM debtTrans WHERE debt_id = ?').get(d.id)
  return {
    id: d.id,
    name: d.name || '',
    type: DEBT_TYPES[d.type] || 'debt',
    person: d.lender || '',
    amount: d.amount / 100,
    paid: totalPaid.paid / 100,
    dueDate: d.due_date ? new Date(d.due_date).toISOString().slice(0, 10) : '',
    lendDate: d.lend_date ? new Date(d.lend_date).toISOString().slice(0, 10) : '',
    note: d.name || '',
    color: d.color || '#78716c',
    status: d.status ? 'paid' : 'active',
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM debt ORDER BY id').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM debt WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Debt not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, type, person, amount, dueDate, lendDate, color, note } = req.body
  const typeNum = Object.keys(DEBT_TYPES).find(k => DEBT_TYPES[k] === type) || 0

  const info = db.prepare(`INSERT INTO debt (name, lender, color, pay, amount, due_date, lend_date, account_id, status, type)
    VALUES (?, ?, ?, 0, ?, ?, ?, 1, 0, ?)`).run(
    note || name || '', person || '', color || '#78716c',
    (Number(amount) || 0) * 100,
    dueDate ? new Date(dueDate).getTime() : 0,
    lendDate ? new Date(lendDate).getTime() : 0,
    Number(typeNum)
  )

  const row = db.prepare('SELECT * FROM debt WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM debt WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Debt not found' })

  const { name, type, person, amount, dueDate, lendDate, color, note, status } = req.body
  const typeNum = type ? (Object.keys(DEBT_TYPES).find(k => DEBT_TYPES[k] === type) || existing.type) : existing.type

  db.prepare(`UPDATE debt SET name=?, lender=?, color=?, amount=?, due_date=?, lend_date=?, status=?, type=? WHERE id=?`).run(
    note ?? name ?? existing.name,
    person ?? existing.lender,
    color ?? existing.color,
    amount !== undefined ? Number(amount) * 100 : existing.amount,
    dueDate !== undefined ? (dueDate ? new Date(dueDate).getTime() : 0) : existing.due_date,
    lendDate !== undefined ? (lendDate ? new Date(lendDate).getTime() : 0) : existing.lend_date,
    status !== undefined ? (status === 'paid' ? 1 : 0) : existing.status,
    Number(typeNum),
    req.params.id
  )

  const row = db.prepare('SELECT * FROM debt WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM debtTrans WHERE debt_id = ?').run(req.params.id)
  db.prepare('DELETE FROM debt WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

router.post('/:id/pay', (req, res) => {
  const debt = db.prepare('SELECT * FROM debt WHERE id = ?').get(req.params.id)
  if (!debt) return res.status(404).json({ error: 'Debt not found' })

  const { wallet, amount, date, note } = req.body
  const w = db.prepare('SELECT id, amount FROM wallet WHERE name = ?').get(wallet)
  if (!w) return res.status(400).json({ error: 'Wallet not found' })

  const payAmount = (Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  db.prepare('INSERT INTO debtTrans (amount, date_time, debt_id, note, type) VALUES (?, ?, ?, ?, ?)').run(
    payAmount, dateTime, req.params.id, note || '', debt.type
  )

  const isDebt = debt.type === 0
  const delta = isDebt ? -payAmount : payAmount
  db.prepare('UPDATE wallet SET amount = amount + ? WHERE id = ?').run(delta, w.id)

  const debtCat = db.prepare("SELECT id FROM category WHERE name = 'Lainnya' AND type = 1").get()
  const incomeCat = db.prepare("SELECT id FROM category WHERE name = 'Gaji' AND type = 2").get()

  db.prepare(`INSERT INTO trans (note, memo, type, amount, date_time, account_id, fee_id,
    category_id, subcategory_id, wallet_id, transfer_wallet_id, trans_amount, debt_id, debt_trans_id, budget_id)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?, 0, ?, -1, 0, ?, 0, ?)`).run(
    note || (isDebt ? `Bayar ${debt.name}` : `Terima ${debt.name}`),
    '', isDebt ? 1 : 0, isDebt ? -payAmount : payAmount,
    dateTime,
    (isDebt ? (debtCat ? debtCat.id : 8) : (incomeCat ? incomeCat.id : 18)),
    w.id, req.params.id, req.body.budget_id || null
  )

  const updated = db.prepare('SELECT * FROM debt WHERE id = ?').get(req.params.id)
  res.json(transform(updated))
})

router.get('/:id/payments', (req, res) => {
  const rows = db.prepare('SELECT * FROM debtTrans WHERE debt_id = ? ORDER BY date_time DESC').all(req.params.id)
  res.json(rows.map(r => ({
    id: r.id,
    amount: r.amount / 100,
    date: r.date_time ? new Date(r.date_time).toISOString().slice(0, 10) : '',
    note: r.note || '',
    type: r.type,
  })))
})

export default router
