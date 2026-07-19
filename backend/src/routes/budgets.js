import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

async function transform(b) {
  let catName = ''
  if (b.category_id) {
    const { data: cat } = await supabase.from('category').select('name').eq('id', b.category_id)
    if (cat && cat.length > 0) catName = cat[0].name
  }
  return {
    id: b.id,
    category: catName,
    category_id: b.category_id,
    amount: b.amount / 100,
    spent: (b.spent || 0) / 100,
    month: b.target_date ? Math.floor(Number(b.target_date) % 100) : 0,
    year: b.target_date ? Math.floor(Number(b.target_date) / 100) : 0,
    note: b.note || '',
    period: b.period || null,
  }
}

router.get('/', async (req, res) => {
  let rows
  if (req.query.month && req.query.year) {
    const period = Number(req.query.year) * 100 + Number(req.query.month)
    const { data: userBudgets } = await supabase
      .from('user_budget')
      .select('*')
      .eq('target_date', period)
    rows = userBudgets || []

    const { data: budgetRows } = await supabase
      .from('budget')
      .select('*')
      .eq('period', period)

    const budgetMap = {}
    for (const br of budgetRows || []) {
      const { data: cat } = await supabase
        .from('category')
        .select('name, type')
        .eq('id', br.category_id)
      if (cat && cat.length > 0 && cat[0].type === 2) {
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
    const { data } = await supabase.from('user_budget').select('*').order('id')
    rows = data || []
  }

  const result = await Promise.all(rows.map(r => transform(r)))

  for (const r of result) {
    if (r.year && r.month) {
      const start = new Date(r.year, r.month - 1, 1).getTime()
      const end = new Date(r.year, r.month, 0, 23, 59, 59).getTime()
      const { data: spentRows } = await supabase
        .from('trans')
        .select('amount')
        .eq('category_id', r.category_id)
        .eq('type', 1)
        .gte('date_time', start)
        .lte('date_time', end)
      let total = 0
      for (const s of spentRows || []) {
        total += Math.abs(s.amount)
      }
      r.spent = total / 100
    }
  }

  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('user_budget').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Budget not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { category, amount, month, year, note } = req.body
  let catId
  if (req.body.category_id) {
    catId = req.body.category_id
  } else {
    const { data: cat } = await supabase.from('category').select('id').eq('name', category)
    catId = cat && cat.length > 0 ? cat[0].id : 0
  }
  const targetDate = year * 100 + month

  const { data } = await supabase.from('user_budget').insert({
    category_id: catId,
    amount: (Number(amount) || 0) * 100,
    note: note || '',
    target_date: targetDate,
  }).select().single()

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('user_budget').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Budget not found' })
  const e = existing[0]

  const { category, amount, month, year, note } = req.body

  const catId = req.body.category_id !== undefined
    ? Number(req.body.category_id)
    : (category
      ? (await supabase.from('category').select('id').eq('name', category)).data?.[0]?.id ?? e.category_id
      : e.category_id)

  const targetDate = (year !== undefined ? Number(year) : Math.floor(e.target_date / 100)) * 100
    + (month !== undefined ? Number(month) : (e.target_date % 100))

  const { data } = await supabase.from('user_budget').update({
    category_id: catId,
    amount: amount !== undefined ? Number(amount) * 100 : e.amount,
    note: note ?? e.note,
    target_date: targetDate,
  }).eq('id', req.params.id).select().single()

  res.json(await transform(data))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('user_budget').delete().eq('id', req.params.id)
  res.json({ success: true })
})

export default router
