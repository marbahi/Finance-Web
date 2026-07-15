import { Router } from 'express'
import db from '../db.js'

const router = Router()

const TEMPLATE_TYPES = { 0: 'expense', 1: 'income' }

function transform(t) {
  const cat = db.prepare('SELECT name FROM category WHERE id = ?').get(t.category_id)
  const wallet = db.prepare('SELECT name FROM wallet WHERE id = ?').get(t.wallet_id)
  const sub = t.subcategory_id ? db.prepare('SELECT name FROM subcategory WHERE id = ?').get(t.subcategory_id) : null
  return {
    id: t.id,
    name: t.name || '',
    type: TEMPLATE_TYPES[t.type] || 'expense',
    amount: t.amount / 100,
    category: cat ? cat.name : '',
    subcategory: sub ? sub.name : '',
    wallet: wallet ? wallet.name : '',
    memo: t.memo || '',
    note: t.note || '',
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM template ORDER BY ordering').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM template WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Template not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, type, amount, category, subcategory, wallet, memo, note } = req.body
  const typeNum = Object.keys(TEMPLATE_TYPES).find(k => TEMPLATE_TYPES[k] === type) || 0
  const cat = category ? db.prepare('SELECT id FROM category WHERE name = ?').get(category) : null
  const w = wallet ? db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet) : null
  const sub = subcategory ? db.prepare('SELECT id FROM subcategory WHERE name = ?').get(subcategory) : null
  const maxOrder = db.prepare('SELECT COALESCE(MAX(ordering),0) + 1 AS next FROM template').get()

  const info = db.prepare(`INSERT INTO template (name, note, memo, amount, category_id, subcategory_id, wallet_id, account_id, ordering)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`).run(
    name || '', note || '', memo || '',
    (Number(amount) || 0) * 100,
    cat ? cat.id : 0, sub ? sub.id : 0, w ? w.id : 0,
    maxOrder.next
  )

  const row = db.prepare('SELECT * FROM template WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM template WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Template not found' })

  const { name, type, amount, category, subcategory, wallet, memo, note } = req.body
  const typeNum = type ? (Object.keys(TEMPLATE_TYPES).find(k => TEMPLATE_TYPES[k] === type) || existing.type) : existing.type
  const cat = category ? (db.prepare('SELECT id FROM category WHERE name = ?').get(category)?.id ?? existing.category_id) : existing.category_id
  const w = wallet ? (db.prepare('SELECT id FROM wallet WHERE name = ?').get(wallet)?.id ?? existing.wallet_id) : existing.wallet_id
  const subCat = subcategory !== undefined
    ? (subcategory ? (db.prepare('SELECT id FROM subcategory WHERE name = ?').get(subcategory)?.id ?? 0) : 0)
    : existing.subcategory_id

  db.prepare(`UPDATE template SET name=?, note=?, memo=?, type=?, amount=?, category_id=?, subcategory_id=?, wallet_id=? WHERE id=?`).run(
    name ?? existing.name, note ?? existing.note, memo ?? existing.memo,
    Number(typeNum), amount !== undefined ? Number(amount) * 100 : existing.amount,
    cat, subCat, w, req.params.id
  )

  const row = db.prepare('SELECT * FROM template WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM template WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
