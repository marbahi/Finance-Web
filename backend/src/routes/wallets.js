import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const WALLET_TYPES = { 0: 'bank', 1: 'cash', 2: 'credit', 3: 'ewallet' }
const WALLET_ICONS = { 0: 'Wallet', 1: 'Bank', 2: 'CreditCard', 3: 'PiggyBank' }

function transform(w) {
  return {
    id: w.id,
    name: w.name,
    type: WALLET_TYPES[w.type] || 'bank',
    balance: w.amount / 100,
    initial: w.initial_amount / 100,
    color: w.color || '#2563eb',
    icon: WALLET_ICONS[w.icon] || 'Wallet',
    active: !!w.active,
    exclude: !!w.exclude,
    hidden: !!w.hidden,
    limit: w.credit_limit || 0,
    dueDate: w.due_date ? new Date(w.due_date).toISOString().slice(0, 10) : '',
    statementDate: w.statement_date ? new Date(w.statement_date).toISOString().slice(0, 10) : '',
  }
}

router.get('/', async (req, res) => {
  const { data } = await supabase.from('wallet').select('*').eq('hidden', 0)
  res.json((data || []).map(transform))
})

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('wallet').select('*').eq('id', req.params.id)
  if (!data || data.length === 0) return res.status(404).json({ error: 'Wallet not found' })
  res.json(transform(data[0]))
})

router.post('/', async (req, res) => {
  const { name, type, balance, initial, color, active, exclude, limit, dueDate, statementDate } = req.body
  const typeNum = Object.keys(WALLET_TYPES).find(k => WALLET_TYPES[k] === type) || 0
  const { data } = await supabase.from('wallet').insert({
    name: name || '',
    type: Number(typeNum),
    amount: (Number(balance) || 0) * 100,
    initial_amount: (Number(initial) || 0) * 100,
    color: color || '#2563eb',
    active: active ? 1 : 0,
    exclude: exclude ? 1 : 0,
    credit_limit: Number(limit) || 0,
    due_date: dueDate ? new Date(dueDate).getTime() : 0,
    statement_date: statementDate ? new Date(statementDate).getTime() : 0,
    account_id: 1,
    ordering: 0,
    icon: Number(typeNum),
    hidden: 0,
  }).select().single()
  res.status(201).json(transform(data))
})

router.put('/:id', async (req, res) => {
  const { name, type, balance, initial, color, active, exclude, limit, dueDate, statementDate } = req.body
  const { data: existing } = await supabase.from('wallet').select('*').eq('id', req.params.id)
  if (!existing || existing.length === 0) return res.status(404).json({ error: 'Wallet not found' })
  const e = existing[0]
  const typeNum = type ? (Object.keys(WALLET_TYPES).find(k => WALLET_TYPES[k] === type) || 0) : undefined

  const { data } = await supabase.from('wallet').update({
    name: name ?? e.name,
    type: typeNum ?? e.type,
    amount: balance !== undefined ? Number(balance) * 100 : e.amount,
    initial_amount: initial !== undefined ? Number(initial) * 100 : e.initial_amount,
    color: color ?? e.color,
    active: active !== undefined ? (active ? 1 : 0) : e.active,
    exclude: exclude !== undefined ? (exclude ? 1 : 0) : e.exclude,
    credit_limit: limit !== undefined ? Number(limit) : e.credit_limit,
    due_date: dueDate !== undefined ? (dueDate ? new Date(dueDate).getTime() : 0) : e.due_date,
    statement_date: statementDate !== undefined ? (statementDate ? new Date(statementDate).getTime() : 0) : e.statement_date,
    icon: typeNum ?? e.icon,
  }).eq('id', req.params.id).select().single()

  res.json(transform(data))
})

router.delete('/:id', async (req, res) => {
  await supabase.from('wallet').delete().eq('id', req.params.id)
  res.json({ success: true })
})

export default router
