import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../../components/Layout'

describe('Layout', () => {
  it('menampilkan judul Finance Monitor', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByText('Finance Monitor')).toBeInTheDocument()
  })

  it('menampilkan semua navigasi menu', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transaksi')).toBeInTheDocument()
    expect(screen.getByText('Dompet')).toBeInTheDocument()
    expect(screen.getByText('Kategori')).toBeInTheDocument()
    expect(screen.getByText('Anggaran')).toBeInTheDocument()
    expect(screen.getByText('Hutang / Piutang')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(screen.getByText('Berulang')).toBeInTheDocument()
    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByText('Laporan')).toBeInTheDocument()
    expect(screen.getByText('Pengaturan')).toBeInTheDocument()
  })
})
