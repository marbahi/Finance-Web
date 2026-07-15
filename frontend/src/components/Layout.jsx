import { NavLink, Outlet } from 'react-router-dom'
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

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            Finance Monitor
          </h1>
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
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
