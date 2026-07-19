import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const DEBT_TYPES = { 0: 'debt', 1: 'receivable' }

async function transform(d) {
  const { data: paidData } = await supabase
    .from('debttrans')
    .select('amount')
    .eq('debt_id', d.id)
  const totalPaid = (paidData || []).reduce((sum, r) => sum + r.amount, 0)
  return {
    id: d.id,
    name: d.name || '',
    type: DEBT_TYPES[d.type] || 'debt',
    person: d.lender || '',
    amount: d.amount / 100,
    paid: totalPaid / 100,
    dueDate: d.due_date ? new Date(d.due_date).toISOString().slice(0, 10) : '',
    lendDate: d.lend_date ? new Date(d.lend_date).toISOString().slice(0, 10) : '',
    note: d.name || '',
    color: d.color || '#78716c',
    status: d.status ? 'paid' : 'active',
  }
}

router.get('/', async (req, res) => {
  const { data } = await supabase.from('debt').select('*').order('id')
  const result = await Promise.all((data || []).map(d => transform(d)))
  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('debt').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Debt not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, type, person, amount, dueDate, lendDate, color, note } = req.body
  const typeNum = Object.keys(DEBT_TYPES).find(k => DEBT_TYPES[k] === type) || 0

  const { data } = await supabase.from('debt').insert({
    name: note || name || '',
    lender: person || '',
    color: color || '#78716c',
    pay: 0,
    amount: (Number(amount) || 0) * 100,
    due_date: dueDate ? new Date(dueDate).getTime() : 0,
    lend_date: lendDate ? new Date(lendDate).getTime() : 0,
    account_id: 1,
    status: 0,
    type: Number(typeNum),
  }).select().single()

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('debt').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Debt not found' })
  const e = existing[0]

  const { name, type, person, amount, dueDate, lendDate, color, note, status } = req.body
  const typeNum = type ? (Object.keys(DEBT_TYPES).find(k => DEBT_TYPES[k] === type) || e.type) : e.type

  const { data } = await supabase.from('debt').update({
    name: note ?? name ?? e.name,
    lender: person ?? e.lender,
    color: color ?? e.color,
    amount: amount !== undefined ? Number(amount) * 100 : e.amount,
    due_date: dueDate !== undefined ? (dueDate ? new Date(dueDate).getTime() : 0) : e.due_date,
    lend_date: lendDate !== undefined ? (lendDate ? new Date(lendDate).getTime() : 0) : e.lend_date,
    status: status !== undefined ? (status === 'paid' ? 1 : 0) : e.status,
    type: Number(typeNum),
  }).eq('id', req.params.id).select().single()

  res.json(await transform(data))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('debttrans').delete().eq('debt_id', req.params.id)
  await supabase.from('debt').delete().eq('id', req.params.id)
  res.json({ success: true })
})

router.post('/:id/pay', async (req, res) => {
  const { data: debt } = await supabase.from('debt').select('*').eq('id', req.params.id)
  if (!debt || debt.length === 0) return res.status(404).json({ error: 'Debt not found' })
  const d = debt[0]

  const { wallet, amount, date, note } = req.body
  const { data: wData } = await supabase.from('wallet').select('id, amount').eq('name', wallet)
  if (!wData || wData.length === 0) return res.status(400).json({ error: 'Wallet not found' })
  const w = wData[0]

  const payAmount = (Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  await supabase.from('debttrans').insert({
    amount: payAmount,
    date_time: dateTime,
    debt_id: req.params.id,
    note: note || '',
    type: d.type,
  })

  const isDebt = d.type === 0
  const delta = isDebt ? -payAmount : payAmount
  await supabase.rpc('update_wallet_balance', { wallet_id: w.id, delta })

  const [{ data: debtCat }, { data: incomeCat }] = await Promise.all([
    supabase.from('category').select('id').eq('name', 'Lainnya').eq('type', 1),
    supabase.from('category').select('id').eq('name', 'Gaji').eq('type', 2),
  ])

  await supabase.from('trans').insert({
    note: note || (isDebt ? `Bayar ${d.name}` : `Terima ${d.name}`),
    memo: '',
    type: isDebt ? 1 : 0,
    amount: isDebt ? -payAmount : payAmount,
    date_time: dateTime,
    account_id: 1,
    fee_id: 0,
    category_id: (isDebt ? (debtCat ? debtCat[0].id : 8) : (incomeCat ? incomeCat[0].id : 18)),
    subcategory_id: 0,
    wallet_id: w.id,
    transfer_wallet_id: -1,
    trans_amount: 0,
    debt_id: req.params.id,
    debt_trans_id: 0,
    budget_id: req.body.budget_id || null,
  })

  const { data: updated } = await supabase.from('debt').select('*').eq('id', req.params.id)
  res.json(await transform(updated[0]))
})

router.get('/:id/payments', async (req, res) => {
  const { data } = await supabase
    .from('debttrans')
    .select('*')
    .eq('debt_id', req.params.id)
    .order('date_time', { ascending: false })
  res.json((data || []).map(r => ({
    id: r.id,
    amount: r.amount / 100,
    date: r.date_time ? new Date(r.date_time).toISOString().slice(0, 10) : '',
    note: r.note || '',
    type: r.type,
  })))
})

export default router
