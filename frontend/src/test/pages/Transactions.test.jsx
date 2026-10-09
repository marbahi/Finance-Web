import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Transactions from '../../pages/Transactions'

const mocks = vi.hoisted(() => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    transactions: [
      { id: 1, date: '2026-07-15', note: 'Bakso', memo: '', type: 'expense', amount: 25000, category: 'Makanan', subcategory: '', wallet: 'Tunai', transferWallet: '' },
      { id: 2, date: '2026-07-14', note: 'Gaji Bulanan', memo: '', type: 'income', amount: 5000000, category: 'Gaji', subcategory: '', wallet: 'Tunai', transferWallet: '' },
      { id: 3, date: '2026-07-13', note: 'Pindah ke BCA', memo: '', type: 'transfer', amount: 100000, category: '', subcategory: '', wallet: 'Tunai', transferWallet: 'BCA' },
    ],
    categories: [
      { id: 1, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: ['Makan Siang'] },
      { id: 2, name: 'Gaji', type: 'income', color: '#059669', subcategories: [] },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
      { id: 2, name: 'BCA', type: 'bank', balance: 1000000, color: '#059669' },
    ],
    createTransaction: mocks.createTransaction,
    updateTransaction: mocks.updateTransaction,
    deleteTransaction: mocks.deleteTransaction,
  }),
}))

describe('Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan daftar transaksi', () => {
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    expect(screen.getByText('Bakso')).toBeInTheDocument()
    expect(screen.getByText('Gaji Bulanan')).toBeInTheDocument()
  })

  it('menampilkan total transaksi', () => {
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    expect(screen.getByText(/3 total transaksi/)).toBeInTheDocument()
  })

  it('menampilkan label Transfer untuk transfer tanpa kategori', () => {
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    const table = screen.getByRole('table')
    expect(within(table).getByText('Transfer')).toBeInTheDocument()
  })

  it('transfer tersimpan tanpa kategori (tidak ada error pilih kategori)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Transactions /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: /tambah transaksi/i }))
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    // Field kategori disembunyikan saat tipe transfer
    expect(screen.queryByDisplayValue('Makanan')).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('0'), '50000')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(mocks.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'transfer', category: '', amount: 50000 }),
    )
  })
})
