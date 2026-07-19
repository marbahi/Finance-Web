import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const RECUR_TYPES = { 0: 'expense', 1: 'income', 2: 'transfer' }
const FREQ_TYPES = { 1: 'daily', 2: 'weekly', 3: 'monthly', 4: 'yearly' }

async function transform(r) {
  const [catData, walletData] = await Promise.all([
    supabase.from('category').select('name').eq('id', r.category_id),
    supabase.from('wallet').select('name').eq('id', r.wallet_id),
  ])
  const cat = catData.data?.[0]
  const wallet = walletData.data?.[0]
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

router.get('/', async (req, res) => {
  const { data } = await supabase.from('recurring').select('*').order('id')
  const result = await Promise.all((data || []).map(r => transform(r)))
  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('recurring').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Recurring not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, type, amount, category, category_id, wallet, wallet_id, frequency, nextDate, note } = req.body
  const typeNum = Object.keys(RECUR_TYPES).find(k => RECUR_TYPES[k] === type) || 0
  const freqNum = Object.keys(FREQ_TYPES).find(k => FREQ_TYPES[k] === frequency) || 3

  let catId = category_id || 0
  if (!catId && category) {
    const { data: cat } = await supabase.from('category').select('id').eq('name', category)
    if (cat && cat.length > 0) catId = cat[0].id
  }
  let wId = wallet_id || 0
  if (!wId && wallet) {
    const { data: w } = await supabase.from('wallet').select('id').eq('name', wallet)
    if (w && w.length > 0) wId = w[0].id
  }
  const dateTime = nextDate ? new Date(nextDate).getTime() : Date.now()

  const { data } = await supabase.from('recurring').insert({
    note: name || '',
    memo: note || '',
    type: Number(typeNum),
    recurring_type: Number(freqNum),
    repeat_type: 0,
    repeat_date: '',
    increment: 0,
    amount: (Number(amount) || 0) * 100,
    date_time: dateTime,
    until_time: 0,
    last_update_time: dateTime,
    account_id: 1,
    category_id: catId,
    wallet_id: wId,
    subcategory_id: 0,
    transfer_wallet_id: 0,
    trans_amount: 0,
    is_future: 1,
  }).select().single()

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('recurring').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Recurring not found' })
  const e = existing[0]

  const { name, type, amount, category, category_id, wallet, wallet_id, frequency, nextDate, note, status } = req.body
  const typeNum = type ? (Object.keys(RECUR_TYPES).find(k => RECUR_TYPES[k] === type) || e.type) : e.type
  const freqNum = frequency ? (Object.keys(FREQ_TYPES).find(k => FREQ_TYPES[k] === frequency) || e.recurring_type) : e.recurring_type

  let catId = category_id !== undefined ? Number(category_id) : e.category_id
  if (category && !category_id) {
    const { data: cat } = await supabase.from('category').select('id').eq('name', category)
    if (cat && cat.length > 0) catId = cat[0].id
  }
  let wId = wallet_id !== undefined ? Number(wallet_id) : e.wallet_id
  if (wallet && !wallet_id) {
    const { data: w } = await supabase.from('wallet').select('id').eq('name', wallet)
    if (w && w.length > 0) wId = w[0].id
  }

  await supabase.from('recurring').update({
    note: name ?? e.note,
    memo: note ?? e.memo,
    type: Number(typeNum),
    recurring_type: Number(freqNum),
    amount: amount !== undefined ? Number(amount) * 100 : e.amount,
    date_time: nextDate !== undefined ? (nextDate ? new Date(nextDate).getTime() : e.date_time) : e.date_time,
    category_id: catId,
    wallet_id: wId,
    is_future: status !== undefined ? (status === 'active' ? 1 : 0) : e.is_future,
  }).eq('id', req.params.id)

  const { data: updated } = await supabase.from('recurring').select('*').eq('id', req.params.id)
  res.json(await transform(updated[0]))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('recurring').delete().eq('id', req.params.id)
  res.json({ success: true })
})

router.patch('/:id/toggle', async (req, res) => {
  const { data: existing } = await supabase.from('recurring').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Recurring not found' })
  const e = existing[0]

  await supabase.from('recurring').update({
    is_future: e.is_future === 1 ? 0 : 1
  }).eq('id', req.params.id)

  const { data: updated } = await supabase.from('recurring').select('*').eq('id', req.params.id)
  res.json(await transform(updated[0]))
})

export default router
