import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Recurring from '../../pages/Recurring'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    recurring: [
      { id: 1, name: 'Listrik', type: 'expense', amount: 300000, category: 'Listrik', wallet: 'Tunai', frequency: 'monthly', nextDate: '2026-08-01', status: 'active', note: '' },
      { id: 2, name: 'Gym', type: 'expense', amount: 150000, category: 'Olahraga', wallet: 'Tunai', frequency: 'monthly', nextDate: '2026-08-10', status: 'paused', note: '' },
    ],
    categories: [
      { id: 1, name: 'Listrik', type: 'expense', color: '#f59e0b', subcategories: [] },
      { id: 2, name: 'Olahraga', type: 'expense', color: '#8b5cf6', subcategories: [] },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
    ],
    createRecurring: vi.fn(),
    updateRecurring: vi.fn(),
    deleteRecurring: vi.fn(),
    toggleRecurring: vi.fn(),
  }),
}))

describe('Recurring', () => {
  it('menampilkan daftar transaksi berulang', () => {
    render(<MemoryRouter><Recurring /></MemoryRouter>)
    expect(screen.getByText('Listrik')).toBeInTheDocument()
    expect(screen.getByText('Gym')).toBeInTheDocument()
  })

  it('menampilkan filter status', () => {
    render(<MemoryRouter><Recurring /></MemoryRouter>)
    expect(screen.getByText('Aktif')).toBeInTheDocument()
  })

  it('menampilkan estimasi bulanan', () => {
    render(<MemoryRouter><Recurring /></MemoryRouter>)
    expect(screen.getByText(/Estimasi Pengeluaran Bulanan/)).toBeInTheDocument()
  })
})
