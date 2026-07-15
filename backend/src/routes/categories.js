import { Router } from 'express'
import db from '../db.js'

const router = Router()

const CAT_TYPES = { 1: 'income', 2: 'expense' }
const CAT_ICONS = [
  'Wallet', 'Package', 'Car', 'ShoppingBag', 'Gift', 'Heart', 'House',
  'Airplane', 'Book', 'FilmStrip', 'FirstAid', 'GraduationCap',
  'Lightbulb', 'MusicNote', 'PiggyBank'
]

function transform(cat) {
  const subcategories = db.prepare('SELECT * FROM subcategory WHERE category_id = ? ORDER BY ordering').all(cat.id)
  return {
    id: cat.id,
    name: cat.name,
    type: CAT_TYPES[cat.type] || 'expense',
    color: cat.color || '#78716c',
    icon: CAT_ICONS[cat.icon] || 'Wallet',
    active: !!cat.active,
    subcategories: subcategories.map(s => s.name),
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM category ORDER BY ordering').all()
  res.json(rows.map(transform))
})

router.get('/all', (req, res) => {
  const rows = db.prepare('SELECT * FROM category ORDER BY type, ordering').all()
  res.json(rows.map(transform))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM category WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Category not found' })
  res.json(transform(row))
})

router.post('/', (req, res) => {
  const { name, type, color, icon, subcategories } = req.body
  const typeNum = Object.keys(CAT_TYPES).find(k => CAT_TYPES[k] === type) || 2
  const maxOrder = db.prepare('SELECT COALESCE(MAX(ordering),0) + 1 AS next FROM category').get()
  const info = db.prepare(`INSERT INTO category (name, color, type, active, ordering, icon, account_id, default_category)
    VALUES (?, ?, ?, 1, ?, 0, 1, 0)`).run(
    name || '', color || '#78716c', Number(typeNum), maxOrder.next
  )
  const catId = info.lastInsertRowid

  if (subcategories && Array.isArray(subcategories)) {
    const ins = db.prepare('INSERT INTO subcategory (category_id, name, ordering) VALUES (?, ?, ?)')
    subcategories.forEach((s, i) => ins.run(catId, s, i))
  }

  const row = db.prepare('SELECT * FROM category WHERE id = ?').get(catId)
  res.status(201).json(transform(row))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM category WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Category not found' })

  const { name, type, color, icon, active, subcategories } = req.body
  const typeNum = type ? (Object.keys(CAT_TYPES).find(k => CAT_TYPES[k] === type) || existing.type) : existing.type

  db.prepare('UPDATE category SET name=?, color=?, type=?, active=? WHERE id=?').run(
    name ?? existing.name,
    color ?? existing.color,
    Number(typeNum),
    active !== undefined ? (active ? 1 : 0) : existing.active,
    req.params.id
  )

  if (subcategories && Array.isArray(subcategories)) {
    db.prepare('DELETE FROM subcategory WHERE category_id = ?').run(req.params.id)
    const ins = db.prepare('INSERT INTO subcategory (category_id, name, ordering) VALUES (?, ?, ?)')
    subcategories.forEach((s, i) => ins.run(req.params.id, s, i))
  }

  const row = db.prepare('SELECT * FROM category WHERE id = ?').get(req.params.id)
  res.json(transform(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM subcategory WHERE category_id = ?').run(req.params.id)
  db.prepare('DELETE FROM category WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
