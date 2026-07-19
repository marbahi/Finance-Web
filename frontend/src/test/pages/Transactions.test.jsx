import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Transactions from '../../pages/Transactions'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    transactions: [
      { id: 1, date: '2026-07-15', note: 'Bakso', memo: '', type: 'expense', amount: 25000, category: 'Makanan', subcategory: '', wallet: 'Tunai', transferWallet: '' },
      { id: 2, date: '2026-07-14', note: 'Gaji Bulanan', memo: '', type: 'income', amount: 5000000, category: 'Gaji', subcategory: '', wallet: 'Tunai', transferWallet: '' },
    ],
    categories: [
      { id: 1, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: ['Makan Siang'] },
      { id: 2, name: 'Gaji', type: 'income', color: '#059669', subcategories: [] },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
    ],
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  }),
}))

describe('Transactions', () => {
  it('menampilkan daftar transaksi', () => {
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    expect(screen.getByText('Bakso')).toBeInTheDocument()
    expect(screen.getByText('Gaji Bulanan')).toBeInTheDocument()
  })

  it('menampilkan total transaksi', () => {
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    expect(screen.getByText(/2 total transaksi/)).toBeInTheDocument()
  })
})
