import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const CAT_TYPES = { 1: 'income', 2: 'expense' }
const CAT_ICONS = [
  'Wallet', 'Package', 'Car', 'ShoppingBag', 'Gift', 'Heart', 'House',
  'Airplane', 'Book', 'FilmStrip', 'FirstAid', 'GraduationCap',
  'Lightbulb', 'MusicNote', 'PiggyBank'
]

async function transform(cat) {
  const { data: subcategories } = await supabase
    .from('subcategory')
    .select('name')
    .eq('category_id', cat.id)
    .order('ordering')
  return {
    id: cat.id,
    name: cat.name,
    type: CAT_TYPES[cat.type] || 'expense',
    color: cat.color || '#78716c',
    icon: CAT_ICONS[cat.icon] || 'Wallet',
    active: !!cat.active,
    subcategories: (subcategories || []).map(s => s.name),
  }
}

router.get('/', async (req, res) => {
  const { data } = await supabase.from('category').select('*').order('ordering')
  const result = await Promise.all((data || []).map(c => transform(c)))
  res.json(result)
})

router.get('/all', async (req, res) => {
  const { data } = await supabase.from('category').select('*').order('type').order('ordering')
  const result = await Promise.all((data || []).map(c => transform(c)))
  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('category').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Category not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, type, color, icon, subcategories } = req.body
  const typeNum = Object.keys(CAT_TYPES).find(k => CAT_TYPES[k] === type) || 2
  const { data: maxOrder } = await supabase
    .from('category')
    .select('ordering')
    .order('ordering', { ascending: false })
    .limit(1)
  const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].ordering + 1 : 1

  const { data } = await supabase.from('category').insert({
    name: name || '',
    color: color || '#78716c',
    type: Number(typeNum),
    active: 1,
    ordering: nextOrder,
    icon: 0,
    account_id: 1,
    default_category: 0,
  }).select().single()

  if (subcategories && Array.isArray(subcategories)) {
    const inserts = subcategories.map((s, i) => ({
      category_id: data.id,
      name: s,
      ordering: i,
    }))
    await supabase.from('subcategory').insert(inserts)
  }

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('category').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Category not found' })
  const e = existing[0]

  const { name, type, color, icon, active, subcategories } = req.body
  const typeNum = type ? (Object.keys(CAT_TYPES).find(k => CAT_TYPES[k] === type) || e.type) : e.type

  await supabase.from('category').update({
    name: name ?? e.name,
    color: color ?? e.color,
    type: Number(typeNum),
    active: active !== undefined ? (active ? 1 : 0) : e.active,
  }).eq('id', req.params.id)

  if (subcategories && Array.isArray(subcategories)) {
    await supabase.from('subcategory').delete().eq('category_id', req.params.id)
    const inserts = subcategories.map((s, i) => ({
      category_id: Number(req.params.id),
      name: s,
      ordering: i,
    }))
    await supabase.from('subcategory').insert(inserts)
  }

  const { data: updated } = await supabase.from('category').select('*').eq('id', req.params.id)
  res.json(await transform(updated[0]))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('subcategory').delete().eq('category_id', req.params.id)
  await supabase.from('category').delete().eq('id', req.params.id)
  res.json({ success: true })
})

export default router
