import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Debts from '../../pages/Debts'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    debts: [
      { id: 1, name: 'Pinjaman Bank', type: 'debt', person: 'Bank ABC', amount: 10000000, paid: 2000000, dueDate: '2026-12-31', status: 'active', color: '#dc2626' },
      { id: 2, name: 'Piutang Budi', type: 'receivable', person: 'Budi', amount: 2000000, paid: 0, dueDate: '2026-08-15', status: 'active', color: '#059669' },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
    ],
    createDebt: vi.fn(),
    updateDebt: vi.fn(),
    deleteDebt: vi.fn(),
    addDebtPayment: vi.fn(),
  }),
}))

describe('Debts', () => {
  it('menampilkan summary cards', () => {
    render(<MemoryRouter><Debts /></MemoryRouter>)
    expect(screen.getByText('Sisa Hutang Aktif')).toBeInTheDocument()
    expect(screen.getByText('Sisa Piutang Aktif')).toBeInTheDocument()
  })

  it('menampilkan daftar hutang/piutang', () => {
    render(<MemoryRouter><Debts /></MemoryRouter>)
    expect(screen.getByText('Pinjaman Bank')).toBeInTheDocument()
    expect(screen.getByText('Piutang Budi')).toBeInTheDocument()
  })
})
