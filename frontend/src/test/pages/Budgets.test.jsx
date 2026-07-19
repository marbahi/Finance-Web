import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Budgets from '../../pages/Budgets'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    budgets: [
      { id: 1, category: 'Makanan', amount: 500000, month: 6, year: 2026 },
      { id: 2, category: 'Transportasi', amount: 300000, month: 6, year: 2026 },
    ],
    transactions: [
      { id: 1, date: '2026-07-15', note: 'Bakso', type: 'expense', amount: 25000, category: 'Makanan', wallet: 'Tunai' },
    ],
    categories: [
      { id: 1, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: [] },
      { id: 2, name: 'Transportasi', type: 'expense', color: '#ea580c', subcategories: [] },
    ],
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
  }),
}))

describe('Budgets', () => {
  it('menampilkan daftar anggaran', () => {
    render(<MemoryRouter><Budgets /></MemoryRouter>)
    expect(screen.getByText('Makanan')).toBeInTheDocument()
    expect(screen.getByText('Transportasi')).toBeInTheDocument()
  })

  it('menampilkan summary anggaran', () => {
    render(<MemoryRouter><Budgets /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Anggaran' })).toBeInTheDocument()
    expect(screen.getByText('Terpakai')).toBeInTheDocument()
    expect(screen.getByText('Sisa')).toBeInTheDocument()
  })
})
