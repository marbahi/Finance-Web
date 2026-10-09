import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Dashboard from '../../pages/Dashboard'
import Wallets from '../../pages/Wallets'

const mockCtx = {
  loading: false,
  transactions: [],
  wallets: [
    { id: 1, name: 'Tunai', type: 'cash', balance: 5000000, initial: 100000, color: '#2563eb', icon: 'Wallet', exclude: false },
    { id: 2, name: 'Kartu Kredit', type: 'credit', balance: -2000000, initial: 0, color: '#dc2626', icon: 'CreditCard', exclude: false, limit: 5000000, dueDate: '2026-08-15', statementDate: '2026-08-10' },
  ],
  budgets: [
    { id: 1, category: 'Makanan', amount: 1000000, spent: 500000, period: 'monthly', color: '#dc2626' },
  ],
  debts: [],
  goals: [],
  categories: [
    { id: 1, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: [] },
  ],
  recurring: [],
  templates: [],
  createWallet: vi.fn(),
  updateWallet: vi.fn(),
  deleteWallet: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => mockCtx,
}))

describe('Full App Flow', () => {
  // Lihat Navigation.test.jsx: sidebar ganda di jsdom, pakai link pertama.
  function clickNav(label) {
    const links = screen.getAllByRole('link', { name: label })
    fireEvent.click(links[0])
  }

  function renderApp(initialRoute = '/') {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="wallets" element={<Wallets />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )
  }

  it('navigasi dari Dashboard ke Dompet dan melihat data', () => {
    renderApp('/')

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)

    clickNav('Dompet')

    expect(screen.getByText('Total Saldo')).toBeInTheDocument()
    expect(screen.getByText('Total Aset')).toBeInTheDocument()
    expect(screen.getByText('Total Hutang')).toBeInTheDocument()
  })

  it('menampilkan data dompet setelah navigasi', () => {
    renderApp('/wallets')

    expect(screen.getAllByText('Kartu Kredit').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Jatuh Tempo')).toBeInTheDocument()
    expect(screen.getByText('2026-08-15')).toBeInTheDocument()
  })

  it('sidebar tetap terlihat setelah navigasi', () => {
    renderApp('/')

    expect(screen.getAllByText('Finance Monitor').length).toBeGreaterThanOrEqual(1)

    clickNav('Dompet')

    expect(screen.getAllByText('Finance Monitor').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Dompet').length).toBeGreaterThanOrEqual(1)
  })
})
