import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'
import { categoryColors } from '../data/initialData'

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ca8a04', '#dc2626', '#ea580c', '#db2777', '#2563eb']

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

export default function Reports() {
  const { transactions, wallets } = useDummy()
  const [year, setYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: 'Ringkasan' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'expense', label: 'Pengeluaran' },
    { key: 'networth', label: 'Kekayaan' },
  ]

  const yearTrans = useMemo(() =>
    transactions.filter(t => t.date.startsWith(String(year))),
    [transactions, year]
  )

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0')
      const mt = yearTrans.filter(t => t.date.startsWith(`${year}-${m}`))
      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i],
        income: mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })
  }, [yearTrans, year])

  const totalIncome = yearTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = yearTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const diff = totalIncome - totalExpense

  const categoryData = useMemo(() => {
    const map = {}
    yearTrans.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: categoryColors[name] || '#78716c' }))
  }, [yearTrans])

  const incomeBreakdown = useMemo(() => {
    const map = {}
    yearTrans.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
  }, [yearTrans])

  const netWorthData = useMemo(() => {
    let cumulative = 0
    return monthlyData.map(m => {
      cumulative += m.income - m.expense
      return { month: m.month, worth: cumulative }
    })
  }, [monthlyData])

  const currentWorth = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1].worth : 0

  const walletBalanceData = wallets.map(w => ({
    name: w.name,
    balance: w.balance,
    color: w.color,
  }))

  const totalAssets = wallets.filter(w => w.type !== 'credit').reduce((s, w) => s + w.balance, 0)
  const totalDebts = wallets.filter(w => w.type === 'credit').reduce((s, w) => s + Math.abs(w.balance), 0)

  return (
    <div className="p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis keuangan tahunan</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setYear(y => y - 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-base font-semibold text-gray-900 min-w-[60px] text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === t.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pemasukan</span>
              <div className="text-xl font-semibold text-emerald-600 mt-1">{formatRp(totalIncome)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pengeluaran</span>
              <div className="text-xl font-semibold text-rose-600 mt-1">{formatRp(totalExpense)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Selisih</span>
              <div className={`text-xl font-semibold mt-1 ${diff >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>{formatRp(diff)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Kekayaan Bersih</span>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatRp(currentWorth)}</div>
            </div>
          </div>

          {/* Income vs Expense Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pemasukan vs Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie + Net Worth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {categoryData.map(c => (
                      <div key={c.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-gray-500">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Kekayaan Bersih</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="worth" name="Kekayaan" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Sumber Pemasukan</h3>
            {incomeBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={incomeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {incomeBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {incomeBreakdown.map(c => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-gray-600">{c.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatRp(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tren Pemasukan</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expense Tab */}
      {activeTab === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {categoryData.map(c => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-gray-600">{c.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatRp(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tren Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Net Worth Tab */}
      {activeTab === 'networth' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Saldo Dompet</span>
              <div className="space-y-2 mt-3">
                {walletBalanceData.map(w => (
                  <div key={w.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                      <span className="text-gray-600">{w.name}</span>
                    </div>
                    <span className={`font-medium ${w.balance >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                      {w.balance >= 0 ? '' : '-'}{formatRp(Math.abs(w.balance))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ringkasan</span>
              <div className="space-y-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Aset</span>
                  <span className="font-medium text-emerald-600">{formatRp(totalAssets)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Hutang</span>
                  <span className="font-medium text-rose-600">{formatRp(totalDebts)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Kekayaan Bersih</span>
                  <span className="font-semibold text-gray-900">{formatRp(totalAssets - totalDebts)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tren Kekayaan Bersih</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rp' + (v / 1000000).toFixed(0) + 'jt'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="worth" name="Kekayaan" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
