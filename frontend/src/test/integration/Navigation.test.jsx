import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Layout from '../../components/Layout'
import Dashboard from '../../pages/Dashboard'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    transactions: [],
    wallets: [],
    budgets: [],
    debts: [],
    goals: [],
    categories: [],
    recurring: [],
    templates: [],
  }),
}))

describe('Navigation Integration', () => {
  function renderWithLayout(initialRoute = '/') {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<div data-testid="page-transactions">Transaksi Page</div>} />
            <Route path="wallets" element={<div data-testid="page-wallets">Dompet Page</div>} />
            <Route path="categories" element={<div data-testid="page-categories">Kategori Page</div>} />
            <Route path="budgets" element={<div data-testid="page-budgets">Anggaran Page</div>} />
            <Route path="debts" element={<div data-testid="page-debts">Hutang Page</div>} />
            <Route path="goals" element={<div data-testid="page-goals">Target Page</div>} />
            <Route path="recurring" element={<div data-testid="page-recurring">Berulang Page</div>} />
            <Route path="templates" element={<div data-testid="page-templates">Template Page</div>} />
            <Route path="reports" element={<div data-testid="page-reports">Laporan Page</div>} />
            <Route path="settings" element={<div data-testid="page-settings">Pengaturan Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('menampilkan semua item navigasi di sidebar', () => {
    renderWithLayout()
    const navLabels = ['Transaksi', 'Dompet', 'Kategori', 'Anggaran',
      'Hutang / Piutang', 'Target', 'Berulang', 'Template', 'Laporan', 'Pengaturan']
    navLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
  })

  it('sidebar menampilkan judul aplikasi', () => {
    renderWithLayout()
    expect(screen.getByText('Finance Monitor')).toBeInTheDocument()
  })

  it('navigasi ke halaman Transaksi saat link diklik', () => {
    renderWithLayout()
    fireEvent.click(screen.getByText('Transaksi'))
    expect(screen.getByTestId('page-transactions')).toBeInTheDocument()
  })

  it('navigasi ke halaman Dompet saat link diklik', () => {
    renderWithLayout()
    fireEvent.click(screen.getByText('Dompet'))
    expect(screen.getByTestId('page-wallets')).toBeInTheDocument()
  })

  it('navigasi ke halaman Pengaturan saat link diklik', () => {
    renderWithLayout()
    fireEvent.click(screen.getByText('Pengaturan'))
    expect(screen.getByTestId('page-settings')).toBeInTheDocument()
  })

  it('menampilkan Dashboard sebagai halaman aktif saat route /', () => {
    renderWithLayout('/')
    const links = screen.getAllByText('Dashboard')
    const dashboardLink = links.find(el => el.closest('a'))
    expect(dashboardLink.closest('a').className).toContain('bg-gray-900')
  })
})
