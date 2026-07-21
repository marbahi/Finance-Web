import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import Layout from '../../components/Layout'

function renderLayout(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('menampilkan judul Finance Monitor', () => {
    const { container } = renderLayout('/')
    const titles = container.querySelectorAll('h1')
    const match = Array.from(titles).find(el => el.textContent === 'Finance Monitor')
    expect(match).toBeTruthy()
  })

  it('menampilkan semua navigasi menu di sidebar', () => {
    const { container } = renderLayout('/')
    const links = container.querySelectorAll('a')
    const labels = ['Dashboard', 'Transaksi', 'Dompet', 'Kategori', 'Anggaran', 'Hutang', 'Target', 'Berulang', 'Template', 'Laporan', 'Pengaturan']
    labels.forEach(label => {
      const found = Array.from(links).find(l => l.textContent.includes(label))
      expect(found).toBeTruthy()
    })
  })
})
