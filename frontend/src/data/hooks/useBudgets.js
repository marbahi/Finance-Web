import { useState, useCallback } from 'react'
import { budgetsApi } from '../../services/api'

export default function useBudgets() {
  const [loading, setLoading] = useState(false)
  const [budgets, setBudgets] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await budgetsApi.list()
      setBudgets(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await budgetsApi.create(data)
    setBudgets(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await budgetsApi.update(id, data)
    setBudgets(prev => prev.map(b => b.id === id ? updated : b))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await budgetsApi.delete(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [])

  return { loading, budgets, setBudgets, list, create, update, remove }
}
