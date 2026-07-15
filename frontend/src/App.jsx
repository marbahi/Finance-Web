import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DummyProvider } from './data/DummyContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Wallets from './pages/Wallets'
import Categories from './pages/Categories'
import Budgets from './pages/Budgets'
import Debts from './pages/Debts'
import Goals from './pages/Goals'
import Recurring from './pages/Recurring'
import Templates from './pages/Templates'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <DummyProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="wallets" element={<Wallets />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="debts" element={<Debts />} />
            <Route path="goals" element={<Goals />} />
            <Route path="recurring" element={<Recurring />} />
            <Route path="templates" element={<Templates />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </DummyProvider>
    </BrowserRouter>
  )
}
