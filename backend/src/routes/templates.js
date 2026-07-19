import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const TEMPLATE_TYPES = { 0: 'expense', 1: 'income' }

async function transform(t) {
  const [catData, walletData, subData] = await Promise.all([
    supabase.from('category').select('name').eq('id', t.category_id),
    supabase.from('wallet').select('name').eq('id', t.wallet_id),
    t.subcategory_id ? supabase.from('subcategory').select('name').eq('id', t.subcategory_id) : Promise.resolve({ data: null }),
  ])
  const cat = catData.data?.[0]
  const wallet = walletData.data?.[0]
  const sub = subData?.data?.[0]
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

router.get('/', async (req, res) => {
  const { data } = await supabase.from('template').select('*').order('ordering')
  const result = await Promise.all((data || []).map(t => transform(t)))
  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('template').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Template not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, type, amount, category, subcategory, wallet, memo, note } = req.body
  const typeNum = Object.keys(TEMPLATE_TYPES).find(k => TEMPLATE_TYPES[k] === type) || 0

  const [catData, wData, subData, orderData] = await Promise.all([
    category ? supabase.from('category').select('id').eq('name', category) : Promise.resolve({ data: null }),
    wallet ? supabase.from('wallet').select('id').eq('name', wallet) : Promise.resolve({ data: null }),
    subcategory ? supabase.from('subcategory').select('id').eq('name', subcategory) : Promise.resolve({ data: null }),
    supabase.from('template').select('ordering').order('ordering', { ascending: false }).limit(1),
  ])

  const cat = catData?.data?.[0]
  const w = wData?.data?.[0]
  const sub = subData?.data?.[0]
  const maxOrder = orderData.data?.[0]
  const nextOrder = maxOrder ? maxOrder.ordering + 1 : 1

  const { data } = await supabase.from('template').insert({
    name: name || '',
    note: note || '',
    memo: memo || '',
    amount: (Number(amount) || 0) * 100,
    category_id: cat ? cat.id : 0,
    subcategory_id: sub ? sub.id : 0,
    wallet_id: w ? w.id : 0,
    account_id: 1,
    ordering: nextOrder,
  }).select().single()

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('template').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Template not found' })
  const e = existing[0]

  const { name, amount, category, subcategory, wallet, memo, note } = req.body

  let catId = e.category_id
  if (category) {
    const { data: cat } = await supabase.from('category').select('id').eq('name', category)
    if (cat && cat.length > 0) catId = cat[0].id
  }
  let wId = e.wallet_id
  if (wallet) {
    const { data: w } = await supabase.from('wallet').select('id').eq('name', wallet)
    if (w && w.length > 0) wId = w[0].id
  }
  let subId = e.subcategory_id
  if (subcategory !== undefined) {
    if (subcategory) {
      const { data: sub } = await supabase.from('subcategory').select('id').eq('name', subcategory)
      subId = sub && sub.length > 0 ? sub[0].id : 0
    } else {
      subId = 0
    }
  }

  const { data } = await supabase.from('template').update({
    name: name ?? e.name,
    note: note ?? e.note,
    memo: memo ?? e.memo,
    amount: amount !== undefined ? Number(amount) * 100 : e.amount,
    category_id: catId,
    subcategory_id: subId,
    wallet_id: wId,
  }).eq('id', req.params.id).select().single()

  res.json(await transform(data))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('template').delete().eq('id', req.params.id)
  res.json({ success: true })
})

export default router
