import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Categories from '../../pages/Categories'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    categories: [
      { id: 1, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: ['Makan Siang', 'Jajan'] },
      { id: 2, name: 'Gaji', type: 'income', color: '#059669', subcategories: [] },
    ],
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  }),
}))

describe('Categories', () => {
  it('menampilkan header jumlah kategori', () => {
    render(<MemoryRouter><Categories /></MemoryRouter>)
    expect(screen.getByText(/pemasukan/)).toBeInTheDocument()
    expect(screen.getByText(/pengeluaran/)).toBeInTheDocument()
  })

  it('menampilkan daftar kategori', () => {
    render(<MemoryRouter><Categories /></MemoryRouter>)
    expect(screen.getByText('Makanan')).toBeInTheDocument()
    expect(screen.getByText('Gaji')).toBeInTheDocument()
  })
})
