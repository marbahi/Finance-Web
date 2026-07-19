import { useState, useCallback } from 'react'
import { transactionsApi } from '../../services/api'

export default function useTransactions(onWalletChange) {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await transactionsApi.list()
      setTransactions(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await transactionsApi.create(data)
    setTransactions(prev => [created, ...prev])
    if (onWalletChange) await onWalletChange()
    return created
  }, [onWalletChange])

  const update = useCallback(async (id, data) => {
    const updated = await transactionsApi.update(id, data)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    if (onWalletChange) await onWalletChange()
    return updated
  }, [onWalletChange])

  const remove = useCallback(async (id) => {
    await transactionsApi.delete(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
    if (onWalletChange) await onWalletChange()
  }, [onWalletChange])

  return { loading, transactions, setTransactions, list, create, update, remove }
}
