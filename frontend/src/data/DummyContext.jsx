import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import {
  transactionsApi, walletsApi, categoriesApi, budgetsApi,
  debtsApi, goalsApi, recurringApi, templatesApi,
} from '../services/api'

const Ctx = createContext()

export function DummyProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [debts, setDebts] = useState([])
  const [goals, setGoals] = useState([])
  const [recurring, setRecurring] = useState([])
  const [templates, setTemplates] = useState([])

  const loaded = useRef(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tx, w, c, b, d, g, r, tm] = await Promise.all([
        transactionsApi.list(),
        walletsApi.list(),
        categoriesApi.list(),
        budgetsApi.list(),
        debtsApi.list(),
        goalsApi.list(),
        recurringApi.list(),
        templatesApi.list(),
      ])
      setTransactions(tx)
      setWallets(w)
      setCategories(c)
      setBudgets(b)
      setDebts(d)
      setGoals(g)
      setRecurring(r)
      setTemplates(tm)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      loadAll()
    }
  }, [loadAll])

  const refreshAll = useCallback(() => {
    loaded.current = false
    loadAll()
  }, [loadAll])

  const refreshEntity = useCallback(async (entity) => {
    try {
      const apis = {
        transactions: () => transactionsApi.list().then(setTransactions),
        wallets: () => walletsApi.list().then(setWallets),
        categories: () => categoriesApi.list().then(setCategories),
        budgets: () => budgetsApi.list().then(setBudgets),
        debts: () => debtsApi.list().then(setDebts),
        goals: () => goalsApi.list().then(setGoals),
        recurring: () => recurringApi.list().then(setRecurring),
        templates: () => templatesApi.list().then(setTemplates),
      }
      if (apis[entity]) await apis[entity]()
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const createTransaction = useCallback(async (data) => {
    const created = await transactionsApi.create(data)
    setTransactions(prev => [created, ...prev])
    return created
  }, [])

  const updateTransaction = useCallback(async (id, data) => {
    const updated = await transactionsApi.update(id, data)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    await transactionsApi.delete(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const createWallet = useCallback(async (data) => {
    const created = await walletsApi.create(data)
    setWallets(prev => [...prev, created])
    return created
  }, [])

  const updateWallet = useCallback(async (id, data) => {
    const updated = await walletsApi.update(id, data)
    setWallets(prev => prev.map(w => w.id === id ? updated : w))
    return updated
  }, [])

  const deleteWallet = useCallback(async (id) => {
    await walletsApi.delete(id)
    setWallets(prev => prev.filter(w => w.id !== id))
  }, [])

  const createCategory = useCallback(async (data) => {
    const created = await categoriesApi.create(data)
    setCategories(prev => [...prev, created])
    return created
  }, [])

  const updateCategory = useCallback(async (id, data) => {
    const updated = await categoriesApi.update(id, data)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const deleteCategory = useCallback(async (id) => {
    await categoriesApi.delete(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const createBudget = useCallback(async (data) => {
    const created = await budgetsApi.create(data)
    setBudgets(prev => [...prev, created])
    return created
  }, [])

  const updateBudget = useCallback(async (id, data) => {
    const updated = await budgetsApi.update(id, data)
    setBudgets(prev => prev.map(b => b.id === id ? updated : b))
    return updated
  }, [])

  const deleteBudget = useCallback(async (id) => {
    await budgetsApi.delete(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [])

  const createDebt = useCallback(async (data) => {
    const created = await debtsApi.create(data)
    setDebts(prev => [...prev, created])
    return created
  }, [])

  const updateDebt = useCallback(async (id, data) => {
    const updated = await debtsApi.update(id, data)
    setDebts(prev => prev.map(d => d.id === id ? updated : d))
    return updated
  }, [])

  const deleteDebt = useCallback(async (id) => {
    await debtsApi.delete(id)
    setDebts(prev => prev.filter(d => d.id !== id))
  }, [])

  const createGoal = useCallback(async (data) => {
    const created = await goalsApi.create(data)
    setGoals(prev => [...prev, created])
    return created
  }, [])

  const updateGoal = useCallback(async (id, data) => {
    const updated = await goalsApi.update(id, data)
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
    return updated
  }, [])

  const deleteGoal = useCallback(async (id) => {
    await goalsApi.delete(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const createRecurring = useCallback(async (data) => {
    const created = await recurringApi.create(data)
    setRecurring(prev => [...prev, created])
    return created
  }, [])

  const updateRecurring = useCallback(async (id, data) => {
    const updated = await recurringApi.update(id, data)
    setRecurring(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  const deleteRecurring = useCallback(async (id) => {
    await recurringApi.delete(id)
    setRecurring(prev => prev.filter(r => r.id !== id))
  }, [])

  const toggleRecurring = useCallback(async (id) => {
    const updated = await recurringApi.toggle(id)
    setRecurring(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  const createTemplate = useCallback(async (data) => {
    const created = await templatesApi.create(data)
    setTemplates(prev => [...prev, created])
    return created
  }, [])

  const updateTemplate = useCallback(async (id, data) => {
    const updated = await templatesApi.update(id, data)
    setTemplates(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const deleteTemplate = useCallback(async (id) => {
    await templatesApi.delete(id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [])

  const addDebtPayment = useCallback(async (debtId, walletName, amount, date, note) => {
    const result = await debtsApi.pay(debtId, { wallet: walletName, amount, date, note })
    setDebts(prev => prev.map(d => d.id === debtId ? result : d))
    await refreshEntity('wallets')
    await refreshEntity('transactions')
    return result
  }, [refreshEntity])

  const addGoalFund = useCallback(async (goalId, walletName, amount, date) => {
    const result = await goalsApi.fund(goalId, { wallet: walletName, amount, date })
    setGoals(prev => prev.map(g => g.id === goalId ? result : g))
    await refreshEntity('wallets')
    await refreshEntity('transactions')
    return result
  }, [refreshEntity])

  return (
    <Ctx.Provider value={{
      loading, error,
      transactions, setTransactions,
      wallets, setWallets,
      categories, setCategories,
      budgets, setBudgets,
      debts, setDebts,
      goals, setGoals,
      recurring, setRecurring,
      templates, setTemplates,
      refreshAll, refreshEntity,
      createTransaction, updateTransaction, deleteTransaction,
      createWallet, updateWallet, deleteWallet,
      createCategory, updateCategory, deleteCategory,
      createBudget, updateBudget, deleteBudget,
      createDebt, updateDebt, deleteDebt,
      createGoal, updateGoal, deleteGoal,
      createRecurring, updateRecurring, deleteRecurring, toggleRecurring,
      createTemplate, updateTemplate, deleteTemplate,
      addDebtPayment, addGoalFund,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useDummy() {
  return useContext(Ctx)
}
