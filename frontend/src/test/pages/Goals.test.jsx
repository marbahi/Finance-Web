import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Goals from '../../pages/Goals'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({
    loading: false,
    goals: [
      { id: 1, name: 'Beli Rumah', icon: 'House', target: 500000000, current: 50000000, deadline: '2028-12-31', color: '#2563eb', note: 'Tabungan rumah', status: 'active' },
      { id: 2, name: 'Mobil Baru', icon: 'Car', target: 200000000, current: 200000000, deadline: '', color: '#059669', note: 'Lunas!', status: 'achieved' },
    ],
    wallets: [
      { id: 1, name: 'Tunai', type: 'cash', balance: 500000, color: '#2563eb' },
    ],
    createGoal: vi.fn(),
    updateGoal: vi.fn(),
    deleteGoal: vi.fn(),
    addGoalFund: vi.fn(),
  }),
}))

describe('Goals', () => {
  it('menampilkan summary cards', () => {
    render(<MemoryRouter><Goals /></MemoryRouter>)
    expect(screen.getByText('Total Target')).toBeInTheDocument()
    expect(screen.getByText('Terkumpul')).toBeInTheDocument()
    expect(screen.getByText('Sisa')).toBeInTheDocument()
  })

  it('menampilkan daftar target', () => {
    render(<MemoryRouter><Goals /></MemoryRouter>)
    expect(screen.getByText('Beli Rumah')).toBeInTheDocument()
    expect(screen.getByText('Mobil Baru')).toBeInTheDocument()
  })

  it('menampilkan badge tercapai', () => {
    render(<MemoryRouter><Goals /></MemoryRouter>)
    expect(screen.getByText('Tercapai')).toBeInTheDocument()
  })
})
