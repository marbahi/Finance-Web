import { Router } from 'express'
import db from '../db.js'

const router = Router()

function transform(b) {
  const cat = b.category_id ? db.prepare('SELECT name FROM category WHERE id = ?').get(b.category_id) : null
  return {
    id: b.id,
    category: cat ? cat.name : '',
    category_id: b.category_id,
    amount: b.amount / 100,
    spent: (b.spent || 0) / 100,
    month: b.target_date ? Math.floor(Number(b.target_date) % 100) : 0,
    year: b.target_date ? Math.floor(Number(b.target_date) / 100) : 0,
    note: b.note || '',
    period: b.period || null,
  }
}

router.get('/', (req, res) => {
  let rows
  if (req.query.month && req.query.year) {
    const period = Number(req.query.year) * 100 + Number(req.query.month)
    rows = db.prepare('SELECT * FROM user_budget WHERE target_date = ?').all(period)

    const budgetRows = db.prepare('SELECT * FROM budget WHERE period = ?').all(period)
    const budgetMap = {}
    for (const br of budgetRows) {
      const cat = db.prepare('SELECT name, type FROM category WHERE id = ?').get(br.category_id)
      if (cat && cat.type === 2) {
        const key = br.category_id
        budgetMap[key] = (budgetMap[key] || 0) + br.amount
      }
    }

    for (const row of rows) {
      if (budgetMap[row.category_id]) {
        row.amount = Math.max(row.amount, budgetMap[row.category_id])
      }
    }
  } else {
    rows = db.prepare('SELECT * FROM user_budget ORDER BY id').all()
  }

  const result = rows.map(transform)

  for (const r of result) {
    if (r.year && r.month) {
      const start = new Date(r.year, r.month - 1, 1).getTime()
      const end = new Date(r.year, r.month, 0, 23, 59, 59).getTime()
      const spentRow = db.prepare(
        'SELECT COALESCE(SUM(ABS(amount)), 0) AS total FROM trans WHERE category_id = ? AND type = 1 AND date_time >= ? AND date_time <= ?'
      ).get(r.category_id, start, end)
      r.spent = spentRow.total / 100
    }
  }

  res.json(result)
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM user_budget WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Budget not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { category, amount, month, year, note } = req.body
  let catId
  if (req.body.category_id) {
    catId = req.body.category_id
  } else {
    const cat = db.prepare('SELECT id FROM category WHERE name = ?').get(category)
    catId = cat ? cat.id : 0
  }
  const targetDate = year * 100 + month

  const info = db.prepare(`INSERT INTO user_budget (category_id, amount, note, target_date)
    VALUES (?, ?, ?, ?)`).run(
    catId, (Number(amount) || 0) * 100, note || '', targetDate
  )

  const row = db.prepare('SELECT * FROM user_budget WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM user_budget WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Budget not found' })

  const { category, amount, month, year, note } = req.body

  const catId = req.body.category_id !== undefined
    ? Number(req.body.category_id)
    : (category
      ? (db.prepare('SELECT id FROM category WHERE name = ?').get(category)?.id ?? existing.category_id)
      : existing.category_id)

  const targetDate = (year !== undefined ? Number(year) : Math.floor(existing.target_date / 100)) * 100
    + (month !== undefined ? Number(month) : (existing.target_date % 100))

  db.prepare('UPDATE user_budget SET category_id=?, amount=?, note=?, target_date=? WHERE id=?').run(
    catId, amount !== undefined ? Number(amount) * 100 : existing.amount,
    note ?? existing.note, targetDate, req.params.id
  )

  const row = db.prepare('SELECT * FROM user_budget WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM user_budget WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
