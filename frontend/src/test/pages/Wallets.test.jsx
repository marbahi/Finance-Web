import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Wallets from '../../pages/Wallets'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, initial: 100000, color: '#2563eb', icon: 'Wallet', exclude: false },
      { id: 2, name: 'Kartu Kredit', type: 'credit', balance: -2000000, initial: 0, color: '#dc2626', icon: 'CreditCard', exclude: false, limit: 5000000, dueDate: '2026-08-15', statementDate: '2026-08-10' },
      { id: 3, name: 'Tabungan', type: 'bank', balance: 10000000, initial: 5000000, color: '#2563eb', icon: 'Bank', exclude: false },
    ],
    createWallet: vi.fn(),
    updateWallet: vi.fn(),
    deleteWallet: vi.fn(),
  }),
}))

describe('Wallets', () => {
  it('menampilkan summary cards', () => {
    render(<MemoryRouter><Wallets /></MemoryRouter>)
    expect(screen.getByText('Total Saldo')).toBeInTheDocument()
    expect(screen.getByText('Total Aset')).toBeInTheDocument()
    expect(screen.getByText('Total Hutang Kartu')).toBeInTheDocument()
  })

  it('menampilkan daftar dompet', () => {
    render(<MemoryRouter><Wallets /></MemoryRouter>)
    expect(screen.getByText('Tabungan')).toBeInTheDocument()
  })

  it('menampilkan detail kartu kredit', () => {
    render(<MemoryRouter><Wallets /></MemoryRouter>)
    expect(screen.getByText('Jatuh Tempo')).toBeInTheDocument()
  })
})
