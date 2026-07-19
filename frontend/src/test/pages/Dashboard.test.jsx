import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../../pages/Dashboard'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    transactions: [],
    wallets: [],
    budgets: [],
    debts: [],
    goals: [],
  }),
}))

describe('Dashboard', () => {
  it('menampilkan judul Dashboard', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('menampilkan label saldo total', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
    expect(screen.getByText('Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Selisih')).toBeInTheDocument()
  })
})
