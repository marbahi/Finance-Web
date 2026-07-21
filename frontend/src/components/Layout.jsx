import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChartPieSlice,
  ArrowsLeftRight,
  Wallet,
  Folder,
  Target,
  HandCoins,
  Trophy,
  Repeat,
  FileText,
  ChartLine,
  GearSix,
  SignOut,
  List,
  X,
} from '@phosphor-icons/react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: ChartPieSlice },
  { to: '/transactions', label: 'Transaksi', icon: ArrowsLeftRight },
  { to: '/wallets', label: 'Dompet', icon: Wallet },
  { to: '/categories', label: 'Kategori', icon: Folder },
  { to: '/budgets', label: 'Anggaran', icon: Target },
  { to: '/debts', label: 'Hutang / Piutang', icon: HandCoins },
  { to: '/goals', label: 'Target', icon: Trophy },
  { to: '/recurring', label: 'Berulang', icon: Repeat },
  { to: '/templates', label: 'Template', icon: FileText },
  { to: '/reports', label: 'Laporan', icon: ChartLine },
  { to: '/settings', label: 'Pengaturan', icon: GearSix },
]

const pageTitles = Object.fromEntries(navItems.map((item) => [item.to, item.label]))

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const currentTitle = pageTitles[location.pathname] || 'Finance Monitor'

  const sidebarContent = (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
        <h1 className="text-base font-semibold text-gray-900 tracking-tight">
          Finance Monitor
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-700 rounded-lg md:hidden"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <SignOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 w-56 bg-white h-full flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden h-14 flex items-center px-4 border-b border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg"
          >
            <List size={22} />
          </button>
          <h1 className="flex-1 text-center text-sm font-semibold text-gray-900 tracking-tight">
            {currentTitle}
          </h1>
          <div className="w-9" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
