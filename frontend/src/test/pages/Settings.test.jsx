import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Settings from '../../pages/Settings'

vi.mock('../../data/DummyContext', () => ({
  useDummy: () => ({}),
}))

describe('Settings', () => {
  it('menampilkan navigasi sidebar', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>)
    expect(screen.getByText('Umum')).toBeInTheDocument()
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Notifikasi')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Tentang')).toBeInTheDocument()
  })

  it('menampilkan form umum', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>)
    expect(screen.getByText('Mata Uang')).toBeInTheDocument()
    expect(screen.getByText('Bahasa')).toBeInTheDocument()
    expect(screen.getByText('Awal Minggu')).toBeInTheDocument()
  })


})
