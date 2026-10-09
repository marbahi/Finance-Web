import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Reports from '../../pages/Reports'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    transactions: [
      { id: 1, date: '2026-07-15', note: 'Bakso', type: 'expense', amount: 25000, category: 'Makanan', wallet: 'Tunai' },
      { id: 2, date: '2026-07-14', note: 'Gaji', type: 'income', amount: 5000000, category: 'Gaji', wallet: 'Tunai' },
      { id: 3, date: '2026-07-13', note: 'Pindah ke BCA', type: 'transfer', amount: 100000, category: '', wallet: 'Tunai', transferWallet: 'BCA' },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, initial: 0, color: '#2563eb' },
      { id: 2, name: 'BCA', type: 'bank', balance: 1000000, initial: 0, color: '#059669' },
    ],
  }),
}))

describe('Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.URL.createObjectURL = vi.fn(() => 'blob:mock')
    window.URL.revokeObjectURL = vi.fn()
  })

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
    expect(screen.getByText('Total Transfer')).toBeInTheDocument()
    expect(screen.getByText('Selisih')).toBeInTheDocument()
  })

  it('menampilkan preset periode dan navigasi tahun', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>)
    expect(screen.getByText('Bulan Ini')).toBeInTheDocument()
    expect(screen.getByText('3 Bulan')).toBeInTheDocument()
    expect(screen.getByText('6 Bulan')).toBeInTheDocument()
    expect(screen.getByText('Tahun Ini')).toBeInTheDocument()
  })

  it('preset non-tahun menyembunyikan navigasi tahun', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Reports /></MemoryRouter>)
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bulan Ini' }))
    expect(screen.queryByText(String(new Date().getFullYear()))).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tahun Ini' }))
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument()
  })

  it('tombol ekspor mengunduh CSV tab aktif', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Reports /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: /ekspor/i }))
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })
})
