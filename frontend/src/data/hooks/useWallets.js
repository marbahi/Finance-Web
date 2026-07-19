import { useState, useCallback } from 'react'
import { walletsApi } from '../../services/api'

export default function useWallets() {
  const [loading, setLoading] = useState(false)
  const [wallets, setWallets] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await walletsApi.list()
      setWallets(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await walletsApi.create(data)
    setWallets(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await walletsApi.update(id, data)
    setWallets(prev => prev.map(w => w.id === id ? updated : w))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await walletsApi.delete(id)
    setWallets(prev => prev.filter(w => w.id !== id))
  }, [])

  return { loading, wallets, setWallets, list, create, update, remove }
}
