import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Templates from '../../pages/Templates'

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
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
  }),
}))

describe('Templates', () => {
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
})
