import { useState, useCallback } from 'react'
import { categoriesApi } from '../../services/api'

export default function useCategories() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoriesApi.list()
      setCategories(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await categoriesApi.create(data)
    setCategories(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await categoriesApi.update(id, data)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await categoriesApi.delete(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  return { loading, categories, setCategories, list, create, update, remove }
}
