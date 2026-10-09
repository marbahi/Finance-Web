import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Templates from '../../pages/Templates'

const mocks = vi.hoisted(() => ({
  createTransaction: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}))

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    templates: [
      { id: 1, name: 'Bayar Listrik', type: 'expense', amount: 300000, category: 'Listrik', subcategory: '', wallet: 'Tunai', memo: 'Bulanan' },
      { id: 2, name: 'Gaji Bulanan', type: 'income', amount: 5000000, category: 'Gaji', subcategory: '', wallet: 'Tunai', memo: '' },
    ],
    categories: [
      { id: 1, name: 'Listrik', type: 'expense', color: '#f59e0b', subcategories: [] },
      { id: 2, name: 'Gaji', type: 'income', color: '#059669', subcategories: [] },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
    ],
    createTemplate: mocks.createTemplate,
    updateTemplate: mocks.updateTemplate,
    deleteTemplate: mocks.deleteTemplate,
    createTransaction: mocks.createTransaction,
  }),
}))

describe('Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan daftar template', () => {
    render(<MemoryRouter><Templates /></MemoryRouter>)
    expect(screen.getByText('Bayar Listrik')).toBeInTheDocument()
    expect(screen.getByText('Gaji Bulanan')).toBeInTheDocument()
  })

  it('menampilkan tombol gunakan template', () => {
    render(<MemoryRouter><Templates /></MemoryRouter>)
    const buttons = screen.getAllByText('Gunakan Template')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('tombol gunakan template membuat transaksi dari template', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Templates /></MemoryRouter>)

    const buttons = screen.getAllByRole('button', { name: 'Gunakan Template' })
    await user.click(buttons[0])

    expect(mocks.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        note: 'Bayar Listrik',
        memo: 'Bulanan',
        category: 'Listrik',
        amount: 300000,
        wallet: 'Tunai',
      }),
    )
  })
})
