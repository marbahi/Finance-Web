import { Router } from 'express'
import db from '../db.js'

const router = Router()

const GOAL_ICONS = ['PiggyBank', 'House', 'Airplane', 'Car', 'GraduationCap', 'Heart', 'Lightbulb', 'Star']

function transform(g) {
  return {
    id: g.id,
    name: g.name || '',
    icon: GOAL_ICONS[g.icon] || 'PiggyBank',
    target: g.amount / 100,
    current: g.saved / 100,
    deadline: g.expect_date ? new Date(g.expect_date).toISOString().slice(0, 10) : '',
    achieveDate: g.achieve_date ? new Date(g.achieve_date).toISOString().slice(0, 10) : '',
    color: g.color || '#2563eb',
    note: g.name || '',
    status: g.status ? 'achieved' : 'active',
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM goal ORDER BY id').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM goal WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Goal not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, icon, target, current, deadline, color } = req.body
  const iconNum = icon ? GOAL_ICONS.indexOf(icon) : -1

  const info = db.prepare(`INSERT INTO goal (name, color, saved, amount, status, account_id, expect_date, currency)
    VALUES (?, ?, ?, ?, 0, 1, ?, 'IDR')`).run(
    name || '', color || '#2563eb',
    (Number(current) || 0) * 100, (Number(target) || 0) * 100,
    deadline ? new Date(deadline).getTime() : 0
  )

  const row = db.prepare('SELECT * FROM goal WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM goal WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Goal not found' })

  const { name, icon, target, current, deadline, color, status } = req.body

  db.prepare(`UPDATE goal SET name=?, color=?, saved=?, amount=?, status=?, expect_date=? WHERE id=?`).run(
    name ?? existing.name,
    color ?? existing.color,
    current !== undefined ? Number(current) * 100 : existing.saved,
    target !== undefined ? Number(target) * 100 : existing.amount,
    status !== undefined ? (status === 'achieved' ? 1 : 0) : existing.status,
    deadline !== undefined ? (deadline ? new Date(deadline).getTime() : 0) : existing.expect_date,
    req.params.id
  )

  const row = db.prepare('SELECT * FROM goal WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM goalTrans WHERE goal_id = ?').run(req.params.id)
  db.prepare('DELETE FROM goal WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

router.post('/:id/fund', (req, res) => {
  const goal = db.prepare('SELECT * FROM goal WHERE id = ?').get(req.params.id)
  if (!goal) return res.status(404).json({ error: 'Goal not found' })

  const { wallet, amount, date } = req.body
  const w = db.prepare('SELECT id, amount FROM wallet WHERE name = ?').get(wallet)
  if (!w) return res.status(400).json({ error: 'Wallet not found' })

  const fundAmount = (Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  db.prepare('UPDATE goal SET saved = saved + ? WHERE id = ?').run(fundAmount, req.params.id)
  db.prepare('INSERT INTO goalTrans (amount, date_time, goal_id, type, note) VALUES (?, ?, ?, 1, ?)').run(
    fundAmount, dateTime, req.params.id, `Dana target: ${goal.name}`
  )

  db.prepare('UPDATE wallet SET amount = amount - ? WHERE id = ?').run(fundAmount, w.id)

  const cat = db.prepare("SELECT id FROM category WHERE name = 'Investasi' AND type = 2").get() ||
              db.prepare('SELECT id FROM category WHERE type = 2 LIMIT 1').get()

  db.prepare(`INSERT INTO trans (note, memo, type, amount, date_time, account_id, fee_id,
    category_id, subcategory_id, wallet_id, transfer_wallet_id, trans_amount, debt_id, debt_trans_id, budget_id)
    VALUES (?, ?, 1, ?, ?, 1, 0, ?, 0, ?, -1, 0, 0, 0, ?)`).run(
    `Dana target: ${goal.name}`, '', -fundAmount, dateTime,
    cat ? cat.id : 0, w.id, req.body.budget_id || null
  )

  const updated = db.prepare('SELECT * FROM goal WHERE id = ?').get(req.params.id)
  res.json(transform(updated))
})

export default router
