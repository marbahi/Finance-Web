import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Reports from '../../pages/Reports'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    transactions: [
      { id: 1, date: '2026-07-15', note: 'Bakso', type: 'expense', amount: 25000, category: 'Makanan', wallet: 'Tunai' },
      { id: 2, date: '2026-07-14', note: 'Gaji', type: 'income', amount: 5000000, category: 'Gaji', wallet: 'Tunai' },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, initial: 0, color: '#2563eb' },
    ],
  }),
}))

describe('Reports', () => {
  it('menampilkan tab navigasi', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>)
    expect(screen.getByText('Ringkasan')).toBeInTheDocument()
    expect(screen.getByText('Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Kekayaan')).toBeInTheDocument()
  })

  it('menampilkan summary cards di tab Ringkasan', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>)
    expect(screen.getByText('Total Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Total Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Selisih')).toBeInTheDocument()
  })
})
