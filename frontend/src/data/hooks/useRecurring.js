import { useState, useCallback } from 'react'
import { recurringApi } from '../../services/api'

export default function useRecurring() {
  const [loading, setLoading] = useState(false)
  const [recurring, setRecurring] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await recurringApi.list()
      setRecurring(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await recurringApi.create(data)
    setRecurring(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await recurringApi.update(id, data)
    setRecurring(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await recurringApi.delete(id)
    setRecurring(prev => prev.filter(r => r.id !== id))
  }, [])

  const toggle = useCallback(async (id) => {
    const updated = await recurringApi.toggle(id)
    setRecurring(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  return { loading, recurring, setRecurring, list, create, update, remove, toggle }
}
