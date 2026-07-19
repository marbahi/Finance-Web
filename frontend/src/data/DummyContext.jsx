import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import useTransactions from './hooks/useTransactions'
import useWallets from './hooks/useWallets'
import useCategories from './hooks/useCategories'
import useBudgets from './hooks/useBudgets'
import useDebts from './hooks/useDebts'
import useGoals from './hooks/useGoals'
import useRecurring from './hooks/useRecurring'
import useTemplates from './hooks/useTemplates'

const Ctx = createContext()

export function DummyProvider({ children }) {
  const [error, setError] = useState(null)

  const tx = useTransactions()
  const w = useWallets()
  const c = useCategories()
  const b = useBudgets()
  const d = useDebts()
  const g = useGoals()
  const r = useRecurring()
  const t = useTemplates()

  const loaded = useRef(false)

  const isLoading = tx.loading || w.loading || c.loading || b.loading ||
    d.loading || g.loading || r.loading || t.loading

  const walletRef = useRef(w.list)
  walletRef.current = w.list

  const txRef = useRef(tx.list)
  txRef.current = tx.list

  const loadAll = useCallback(async () => {
    setError(null)
    try {
      await Promise.all([
        tx.list(), w.list(), c.list(), b.list(),
        d.list(), g.list(), r.list(), t.list(),
      ])
    } catch (e) {
      setError(e.message)
    }
  }, [tx.list, w.list, c.list, b.list, d.list, g.list, r.list, t.list])

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      loadAll()
    }
  }, [loadAll])

  const createTransaction = useCallback(async (data) => {
    const created = await tx.create(data)
    await walletRef.current()
    return created
  }, [tx])

  const updateTransaction = useCallback(async (id, data) => {
    const updated = await tx.update(id, data)
    await walletRef.current()
    return updated
  }, [tx])

  const deleteTransaction = useCallback(async (id) => {
    await tx.remove(id)
    await walletRef.current()
  }, [tx])

  const addDebtPayment = useCallback(async (debtId, walletName, amount, date, note) => {
    const result = await d.addPayment(debtId, walletName, amount, date, note)
    await walletRef.current()
    await txRef.current()
    return result
  }, [d])

  const addGoalFund = useCallback(async (goalId, walletName, amount, date) => {
    const result = await g.addFund(goalId, walletName, amount, date)
    await walletRef.current()
    await txRef.current()
    return result
  }, [g])

  return (
    <Ctx.Provider value={{
      loading: isLoading,
      error,
      transactions: tx.transactions,
      wallets: w.wallets,
      categories: c.categories,
      budgets: b.budgets,
      debts: d.debts,
      goals: g.goals,
      recurring: r.recurring,
      templates: t.templates,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      createWallet: w.create,
      updateWallet: w.update,
      deleteWallet: w.remove,
      createCategory: c.create,
      updateCategory: c.update,
      deleteCategory: c.remove,
      createBudget: b.create,
      updateBudget: b.update,
      deleteBudget: b.remove,
      createDebt: d.create,
      updateDebt: d.update,
      deleteDebt: d.remove,
      createGoal: g.create,
      updateGoal: g.update,
      deleteGoal: g.remove,
      createRecurring: r.create,
      updateRecurring: r.update,
      deleteRecurring: r.remove,
      toggleRecurring: r.toggle,
      createTemplate: t.create,
      updateTemplate: t.update,
      deleteTemplate: t.remove,
      addDebtPayment,
      addGoalFund,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useDummy() {
  return useContext(Ctx)
}
