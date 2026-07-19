import { useState, useCallback } from 'react'
import { debtsApi } from '../../services/api'

export default function useDebts(onWalletChange, onTransactionChange) {
  const [loading, setLoading] = useState(false)
  const [debts, setDebts] = useState([])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await debtsApi.list()
      setDebts(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    const created = await debtsApi.create(data)
    setDebts(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id, data) => {
    const updated = await debtsApi.update(id, data)
    setDebts(prev => prev.map(d => d.id === id ? updated : d))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await debtsApi.delete(id)
    setDebts(prev => prev.filter(d => d.id !== id))
  }, [])

  const addPayment = useCallback(async (debtId, walletName, amount, date, note) => {
    const result = await debtsApi.pay(debtId, { wallet: walletName, amount, date, note })
    setDebts(prev => prev.map(d => d.id === debtId ? result : d))
    if (onWalletChange) await onWalletChange()
    if (onTransactionChange) await onTransactionChange()
    return result
  }, [onWalletChange, onTransactionChange])

  return { loading, debts, setDebts, list, create, update, remove, addPayment }
}
