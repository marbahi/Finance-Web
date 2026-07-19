import { useState, useCallback } from 'react'
import { goalsApi } from '../../services/api'

export default function useGoals(onWalletChange, onTransactionChange) {
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await goalsApi.list()
      setGoals(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await goalsApi.create(data)
    setGoals(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await goalsApi.update(id, data)
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await goalsApi.delete(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const addFund = useCallback(async (goalId, walletName, amount, date) => {
    const result = await goalsApi.fund(goalId, { wallet: walletName, amount, date })
    setGoals(prev => prev.map(g => g.id === goalId ? result : g))
    if (onWalletChange) await onWalletChange()
    if (onTransactionChange) await onTransactionChange()
    return result
  }, [onWalletChange, onTransactionChange])

  return { loading, goals, setGoals, list, create, update, remove, addFund }
}
