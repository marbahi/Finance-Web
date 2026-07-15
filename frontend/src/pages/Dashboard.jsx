import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Wallet, TrendUp, TrendDown, CurrencyDollar,
} from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'
import { categoryColors } from '../data/initialData'

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatDate(d) {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {formatRp(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { loading, transactions, wallets, budgets, debts, goals } = useDummy()

  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthTransactions = useMemo(() =>
    transactions.filter(t => t.date.startsWith(monthStr)),
    [transactions, monthStr]
  )

  // Monthly bar chart data (last 6 months)
  const barData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const mTrans = transactions.filter(t => t.date.startsWith(prefix))
      months.push({
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        income: mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      })
    }
    return months
  }, [transactions, now])

  // Top expense categories
  const pieData = useMemo(() => {
    const map = {}
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, color: categoryColors[name] || '#78716c' }))
  }, [monthTransactions])

  const recentTrans = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [transactions]
  )

  const activeBudgets = useMemo(() => {
    const fb = budgets.filter(b => b.month === now.getMonth() && b.year === now.getFullYear())
    const mm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return fb.map(b => ({
      ...b,
      spent: transactions.filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(mm))
        .reduce((s, t) => s + t.amount, 0),
    }))
  }, [budgets, transactions, now])

  if (loading) {
    return (
      <div className="p-5 font-sans flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-gray-400">Memuat data...</div>
      </div>
    )
  }

  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const includedWallets = wallets.filter(w => !w.exclude)
  const totalBalance = includedWallets.reduce((s, w) => s + w.balance, 0)

  const activeDebts = debts.filter(d => d.status === 'active')
  const activeGoals = goals.filter(g => g.current < g.target).slice(0, 3)

  const COLORS = ['#dc2626', '#ea580c', '#db2777', '#2563eb', '#78716c']

  return (
    <div className="p-5 font-sans space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan keuangan bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Saldo Total</span>
            <Wallet size={18} className="text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{formatRp(totalBalance)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pemasukan</span>
            <TrendUp size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-emerald-600">{formatRp(income)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pengeluaran</span>
            <TrendDown size={18} className="text-rose-400" />
          </div>
          <div className="text-2xl font-semibold text-rose-600">{formatRp(expense)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Selisih</span>
            <CurrencyDollar size={18} className="text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{formatRp(income - expense)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pemasukan vs Pengeluaran (6 bulan)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Kategori</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-500">{c.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">{formatRp(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data pengeluaran bulan ini</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h3>
          <span onClick={() => navigate('/transactions')}
            className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Lihat semua</span>
        </div>
        <div className="space-y-2">
          {recentTrans.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  t.type === 'income' ? 'bg-emerald-50' : t.type === 'expense' ? 'bg-rose-50' : 'bg-gray-50'
                }`}>
                  {t.type === 'income' ? <TrendUp size={14} className="text-emerald-500" /> :
                   t.type === 'expense' ? <TrendDown size={14} className="text-rose-500" /> :
                   <CurrencyDollar size={14} className="text-gray-500" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{t.note}</div>
                  <div className="text-xs text-gray-400">{t.category} · {formatDate(t.date)}</div>
                </div>
              </div>
              <div className={`text-sm font-semibold shrink-0 ml-3 ${
                t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-rose-600' : 'text-gray-600'
              }`}>
                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatRp(t.amount)}
              </div>
            </div>
          ))}
          {recentTrans.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi</p>
          )}
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Budget Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Anggaran Bulan Ini</h3>
          {activeBudgets.length > 0 ? (
            <div className="space-y-3">
              {activeBudgets.slice(0, 4).map(b => {
                const pct = Math.min((b.spent / b.amount) * 100, 100)
                const over = b.spent > b.amount
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{b.category}</span>
                      <span className={`font-medium ${over ? 'text-rose-500' : 'text-gray-600'}`}>
                        {formatRp(b.spent)} / {formatRp(b.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-gray-900'}`}
                        style={{ width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada anggaran</p>
          )}
        </div>

        {/* Active Debts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Hutang / Piutang Aktif</h3>
          {activeDebts.length > 0 ? (
            <div className="space-y-3">
              {activeDebts.slice(0, 4).map(d => {
                const pct = (d.paid / d.amount) * 100
                return (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{d.name}</span>
                      <span className={`font-medium ${d.type === 'debt' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {formatRp(d.amount - d.paid)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${d.type === 'debt' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tidak ada hutang/piutang aktif</p>
          )}
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Target Keuangan</h3>
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map(g => {
                const pct = (g.current / g.target) * 100
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{g.name}</span>
                      <span className="font-medium text-gray-600">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-900"
                        style={{ width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada target</p>
          )}
        </div>
      </div>
    </div>
  )
}
