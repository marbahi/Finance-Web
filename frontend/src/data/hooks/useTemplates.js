import { useState, useCallback } from 'react'
import { templatesApi } from '../../services/api'

export default function useTemplates() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await templatesApi.list()
      setTemplates(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await templatesApi.create(data)
    setTemplates(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await templatesApi.update(id, data)
    setTemplates(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await templatesApi.delete(id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [])

  return { loading, templates, setTemplates, list, create, update, remove }
}
