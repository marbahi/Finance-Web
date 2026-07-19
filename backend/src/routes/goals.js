import { Router } from 'express'
import supabase from '../supabase.js'

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

router.get('/', async (req, res) => {
  const { data } = await supabase.from('goal').select('*').order('id')
  res.json((data || []).map(transform))
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('goal').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Goal not found' })
  res.json(transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, icon, target, current, deadline, color } = req.body

  const { data } = await supabase.from('goal').insert({
    name: name || '',
    color: color || '#2563eb',
    saved: (Number(current) || 0) * 100,
    amount: (Number(target) || 0) * 100,
    status: 0,
    account_id: 1,
    expect_date: deadline ? new Date(deadline).getTime() : 0,
    currency: 'IDR',
  }).select().single()

  res.status(201).json(transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existing } = await supabase.from('goal').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Goal not found' })
  const e = existing[0]

  const { name, icon, target, current, deadline, color, status } = req.body

  const { data } = await supabase.from('goal').update({
    name: name ?? e.name,
    color: color ?? e.color,
    saved: current !== undefined ? Number(current) * 100 : e.saved,
    amount: target !== undefined ? Number(target) * 100 : e.amount,
    status: status !== undefined ? (status === 'achieved' ? 1 : 0) : e.status,
    expect_date: deadline !== undefined ? (deadline ? new Date(deadline).getTime() : 0) : e.expect_date,
  }).eq('id', req.params.id).select().single()

  res.json(transform(data))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('goaltrans').delete().eq('goal_id', req.params.id)
  await supabase.from('goal').delete().eq('id', req.params.id)
  res.json({ success: true })
})

router.post('/:id/fund', async (req, res) => {
  const { data: goalArr } = await supabase.from('goal').select('*').eq('id', req.params.id)
  if (!goalArr || goalArr.length === 0) return res.status(404).json({ error: 'Goal not found' })
  const goal = goalArr[0]

  const { wallet, amount, date } = req.body
  const { data: wData } = await supabase.from('wallet').select('id, amount').eq('name', wallet)
  if (!wData || wData.length === 0) return res.status(400).json({ error: 'Wallet not found' })
  const w = wData[0]

  const fundAmount = (Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  const { data: currentGoal } = await supabase.from('goal').select('saved').eq('id', req.params.id).single()
  await supabase.from('goal').update({
    saved: (currentGoal?.saved || 0) + fundAmount
  }).eq('id', req.params.id)

  await supabase.from('goaltrans').insert({
    amount: fundAmount,
    date_time: dateTime,
    goal_id: req.params.id,
    type: 1,
    note: `Dana target: ${goal.name}`,
  })

  await supabase.rpc('update_wallet_balance', { wallet_id: w.id, delta: -fundAmount })

  const { data: catData } = await supabase.from('category').select('id')
    .eq('name', 'Investasi')
    .eq('type', 2)
  const cat = catData && catData.length > 0 ? catData[0]
    : (await supabase.from('category').select('id').eq('type', 2).limit(1)).data?.[0]

  await supabase.from('trans').insert({
    note: `Dana target: ${goal.name}`,
    memo: '',
    type: 1,
    amount: -fundAmount,
    date_time: dateTime,
    account_id: 1,
    fee_id: 0,
    category_id: cat ? cat.id : 0,
    subcategory_id: 0,
    wallet_id: w.id,
    transfer_wallet_id: -1,
    trans_amount: 0,
    debt_id: 0,
    debt_trans_id: 0,
    budget_id: req.body.budget_id || null,
  })

  const { data: updated } = await supabase.from('goal').select('*').eq('id', req.params.id)
  res.json(transform(updated[0]))
})

export default router
