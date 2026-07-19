import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const TRANS_TYPES = { 0: 'income', 1: 'expense', 2: 'transfer' }

async function lookupName(table, id) {
  if (!id || id <= 0) return ''
  const { data } = await supabase.from(table).select('name').eq('id', id)
  return data && data.length > 0 ? data[0].name : ''
}

async function transform(t) {
  const [walletName, catName, subName, transferWalletName] = await Promise.all([
    lookupName('wallet', t.wallet_id),
    lookupName('category', t.category_id),
    lookupName('subcategory', t.subcategory_id),
    t.transfer_wallet_id > 0 ? lookupName('wallet', t.transfer_wallet_id) : Promise.resolve(''),
  ])
  return {
    id: t.id,
    date: t.date_time ? new Date(t.date_time).toISOString().slice(0, 10) : '',
    note: t.note || '',
    memo: t.memo || '',
    type: TRANS_TYPES[t.type] || 'expense',
    amount: Math.abs(t.amount) / 100,
    category: catName,
    subcategory: subName,
    wallet: walletName,
    transferWallet: transferWalletName,
  }
}

async function updateWalletBalance(typeNum, amountCents, walletId, transferWalletId, direction) {
  const absAmount = Math.abs(amountCents)
  const mult = direction === 'reverse' ? -1 : 1
  const delta = absAmount * mult
  if (Number(typeNum) === 1) {
    await supabase.rpc('update_wallet_balance', { wallet_id: walletId, delta: -delta })
  } else if (Number(typeNum) === 0) {
    await supabase.rpc('update_wallet_balance', { wallet_id: walletId, delta })
  } else if (Number(typeNum) === 2) {
    await supabase.rpc('update_wallet_balance', { wallet_id: walletId, delta: -delta })
    if (transferWalletId > 0) {
      await supabase.rpc('update_wallet_balance', { wallet_id: transferWalletId, delta })
    }
  }
}

router.get('/', async (req, res) => {
  let query = supabase.from('trans').select('*')
  query = query.order('date_time', { ascending: false })

  if (req.query.type !== undefined) {
    const typeKeys = Object.keys(TRANS_TYPES)
    const typeNum = typeKeys.find(k => TRANS_TYPES[k] === req.query.type)
    if (typeNum !== undefined) {
      query = query.eq('type', Number(typeNum))
    }
  }

  if (req.query.wallet_id) {
    const wid = Number(req.query.wallet_id)
    const { data: walletData } = await supabase
      .from('trans').select('*').or(`wallet_id.eq.${wid},transfer_wallet_id.eq.${wid}`)
      .order('date_time', { ascending: false })
    const result = await Promise.all((walletData || []).map(t => transform(t)))
    return res.json(result)
  }

  if (req.query.category_id) {
    query = query.eq('category_id', Number(req.query.category_id))
  }

  if (req.query.month && req.query.year) {
    const start = new Date(Number(req.query.year), Number(req.query.month) - 1, 1).getTime()
    const end = new Date(Number(req.query.year), Number(req.query.month), 0, 23, 59, 59).getTime()
    query = query.gte('date_time', start).lte('date_time', end)
  }

  const { data } = await query
  const result = await Promise.all((data || []).map(t => transform(t)))
  res.json(result)
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('trans').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Transaction not found' })
  res.json(await transform(data[0]))
})

router.post('/', async (req, res) => {
  const { date, note, memo, type, amount, category, subcategory, wallet, transferWallet } = req.body

  const [w, cat, sub, tw] = await Promise.all([
    wallet ? supabase.from('wallet').select('id').eq('name', wallet) : Promise.resolve({ data: null }),
    category ? supabase.from('category').select('id').eq('name', category) : Promise.resolve({ data: null }),
    subcategory
      ? supabase.from('subcategory').select('id').eq('name', subcategory)
      : Promise.resolve({ data: null }),
    transferWallet ? supabase.from('wallet').select('id').eq('name', transferWallet) : Promise.resolve({ data: null }),
  ])

  const walletId = w.data && w.data.length > 0 ? w.data[0].id : 0
  const catId = cat.data && cat.data.length > 0 ? cat.data[0].id : null
  const subId = sub.data && sub.data.length > 0 ? sub.data[0].id : null
  const twId = tw.data && tw.data.length > 0 ? tw.data[0].id : -1

  const typeNum = Object.keys(TRANS_TYPES).find(k => TRANS_TYPES[k] === type) || 1
  const dbAmount = (typeNum === 1 ? -1 : 1) * Math.abs(Number(amount) || 0) * 100
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : Date.now()

  const { data } = await supabase.from('trans').insert({
    note: note || '',
    memo: memo || '',
    type: Number(typeNum),
    amount: dbAmount,
    date_time: dateTime,
    account_id: 1,
    fee_id: 0,
    category_id: catId || 0,
    subcategory_id: subId || 0,
    wallet_id: walletId,
    transfer_wallet_id: twId,
    trans_amount: typeNum === 2 ? Math.abs(Number(amount)) : 0,
    debt_id: 0,
    debt_trans_id: 0,
    budget_id: req.body.budget_id || null,
  }).select().single()

  await updateWalletBalance(typeNum, dbAmount, walletId, twId, 'apply')

  res.status(201).json(await transform(data))
})

router.put('/:id', async (req, res) => {
  const { data: existingArr } = await supabase.from('trans').select('*').eq('id', req.params.id)
  if (!existingArr || existingArr.length === 0) return res.status(404).json({ error: 'Transaction not found' })
  const existing = existingArr[0]

  await updateWalletBalance(existing.type, existing.amount, existing.wallet_id, existing.transfer_wallet_id, 'reverse')

  const { date, note, memo, type, amount, category, subcategory, wallet, transferWallet } = req.body

  const [w, cat, sub, tw] = await Promise.all([
    wallet ? supabase.from('wallet').select('id').eq('name', wallet) : Promise.resolve({ data: null }),
    category ? supabase.from('category').select('id').eq('name', category) : Promise.resolve({ data: null }),
    subcategory !== undefined
      ? (subcategory ? supabase.from('subcategory').select('id').eq('name', subcategory) : Promise.resolve({ data: [] }))
      : Promise.resolve({ data: null }),
    transferWallet !== undefined
      ? (transferWallet ? supabase.from('wallet').select('id').eq('name', transferWallet) : Promise.resolve({ data: [] }))
      : Promise.resolve({ data: null }),
  ])

  const typeNum = type ? (Object.keys(TRANS_TYPES).find(k => TRANS_TYPES[k] === type) || existing.type) : existing.type
  const dbAmount = amount !== undefined
    ? (Number(typeNum) === 1 ? -1 : 1) * Math.abs(Number(amount)) * 100
    : existing.amount
  const dateTime = date ? new Date(date + 'T00:00:00').getTime() : existing.date_time

  const wId = w.data && w.data.length > 0 ? w.data[0].id : existing.wallet_id
  const catId = cat.data && cat.data.length > 0 ? cat.data[0].id : existing.category_id
  const subId = sub.data !== null ? (sub.data.length > 0 ? sub.data[0].id : 0) : existing.subcategory_id
  const twId = tw.data !== null ? (tw.data.length > 0 ? tw.data[0].id : -1) : existing.transfer_wallet_id

  await supabase.from('trans').update({
    note: note ?? existing.note,
    memo: memo ?? existing.memo,
    type: Number(typeNum),
    amount: dbAmount,
    date_time: dateTime,
    category_id: catId,
    subcategory_id: subId,
    wallet_id: wId,
    transfer_wallet_id: twId,
  }).eq('id', req.params.id)

  await updateWalletBalance(typeNum, dbAmount, wId, twId, 'apply')

  const { data: updated } = await supabase.from('trans').select('*').eq('id', req.params.id)
  res.json(await transform(updated[0]))
})

router.delete('/:id', async (req, res) => {
  const { data: tArr } = await supabase.from('trans').select('*').eq('id', req.params.id)
  if (!tArr || tArr.length === 0) return res.status(404).json({ error: 'Transaction not found' })
  const t = tArr[0]
  await updateWalletBalance(t.type, t.amount, t.wallet_id, t.transfer_wallet_id, 'reverse')
  await supabase.from('trans').delete().eq('id', req.params.id)
  res.json({ success: true })
})

export default router
