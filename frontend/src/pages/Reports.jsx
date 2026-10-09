import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { CaretLeft, CaretRight, Download } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'
import { categoryColors } from '../data/initialData'
import { buildReportCSV, downloadCSV } from '../utils/reportCsv'

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatAxis(v) {
  const abs = Math.abs(v)
  if (abs >= 1000000) return 'Rp' + trimNum(v / 1000000) + 'jt'
  if (abs >= 1000) return 'Rp' + trimNum(v / 1000) + 'rb'
  return 'Rp' + v
}

function trimNum(n) {
  return String(Number(n.toFixed(1)))
}

function isoDay(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function sumBy(list, type) {
  return list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0)
}

const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ca8a04', '#dc2626', '#ea580c', '#db2777', '#2563eb']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

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
  const [preset, setPreset] = useState('year')

  const tabs = [
    { key: 'overview', label: 'Ringkasan' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'expense', label: 'Pengeluaran' },
    { key: 'networth', label: 'Kekayaan' },
  ]

  const presets = [
    { key: 'month', label: 'Bulan Ini' },
    { key: 'last3', label: '3 Bulan' },
    { key: 'last6', label: '6 Bulan' },
    { key: 'year', label: 'Tahun Ini' },
  ]

  const now = new Date()

  // P1: rentang periode berdasarkan preset
  const range = useMemo(() => {
    const y = now.getFullYear()
    const m = now.getMonth()
    if (preset === 'year') return { start: `${year}-01-01`, end: `${year}-12-31` }
    if (preset === 'month') return { start: isoDay(y, m, 1), end: isoDay(y, m, now.getDate()) }
    const n = preset === 'last3' ? 3 : 6
    const d = new Date(y, m - (n - 1), 1)
    return { start: isoDay(d.getFullYear(), d.getMonth(), 1), end: isoDay(y, m, now.getDate()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, year])

  const periodLabel = preset === 'year'
    ? `Tahun ${year}`
    : preset === 'month'
      ? now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : `${preset === 'last3' ? '3' : '6'} bulan terakhir`

  const periodTrans = useMemo(() =>
    transactions.filter(t => t.date >= range.start && t.date <= range.end),
    [transactions, range]
  )

  // P1+P3: bucket adaptif (harian untuk sebulan, bulanan untuk sisanya) + kolom transfer
  const buckets = useMemo(() => {
    if (preset === 'month') {
      const y = now.getFullYear()
      const m = now.getMonth()
      return Array.from({ length: now.getDate() }, (_, i) => {
        const day = isoDay(y, m, i + 1)
        const dt = periodTrans.filter(t => t.date === day)
        return {
          label: String(i + 1),
          income: sumBy(dt, 'income'),
          expense: sumBy(dt, 'expense'),
          transfer: sumBy(dt, 'transfer'),
        }
      })
    }
    const list = []
    if (preset === 'year') {
      for (let i = 0; i < 12; i++) {
        const prefix = `${year}-${String(i + 1).padStart(2, '0')}`
        const mt = periodTrans.filter(t => t.date.startsWith(prefix))
        list.push({
          label: MONTH_SHORT[i],
          income: sumBy(mt, 'income'),
          expense: sumBy(mt, 'expense'),
          transfer: sumBy(mt, 'transfer'),
        })
      }
    } else {
      const n = preset === 'last3' ? 3 : 6
      for (let k = n - 1; k >= 0; k--) {
        const d = new Date(now.getFullYear(), now.getMonth() - k, 1)
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const mt = periodTrans.filter(t => t.date.startsWith(prefix))
        list.push({
          label: MONTH_SHORT[d.getMonth()],
          income: sumBy(mt, 'income'),
          expense: sumBy(mt, 'expense'),
          transfer: sumBy(mt, 'transfer'),
        })
      }
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodTrans, preset, year])

  const totalIncome = sumBy(periodTrans, 'income')
  const totalExpense = sumBy(periodTrans, 'expense')
  const totalTransfer = sumBy(periodTrans, 'transfer')
  const diff = totalIncome - totalExpense

  const categoryData = useMemo(() => {
    const map = {}
    periodTrans.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: categoryColors[name] || '#78716c' }))
  }, [periodTrans])

  const incomeBreakdown = useMemo(() => {
    const map = {}
    periodTrans.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
  }, [periodTrans])

  const totalAssets = wallets.filter(w => w.type !== 'credit').reduce((s, w) => s + w.balance, 0)
  const totalDebts = wallets.filter(w => w.type === 'credit').reduce((s, w) => s + Math.abs(w.balance), 0)
  const walletNet = totalAssets - totalDebts

  // P4: kekayaan kumulatif berjangkar pada saldo dompet aktual.
  // opening = saldo bersih kini - seluruh arus kas tercatat, sehingga ujung
  // periode yang mencakup semua histori tepat sama dengan saldo dompet.
  const recordedNet = useMemo(() =>
    transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0), 0),
    [transactions]
  )
  const openingWorth = walletNet - recordedNet

  const netWorthData = useMemo(() => {
    let cumulative = openingWorth
    return buckets.map(b => {
      cumulative += b.income - b.expense
      return { label: b.label, worth: cumulative }
    })
  }, [buckets, openingWorth])

  const currentWorth = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1].worth : openingWorth

  const walletBalanceData = wallets.map(w => ({
    name: w.name,
    balance: w.balance,
    color: w.color,
  }))

  // P2: ekspor CSV sesuai tab aktif
  function handleExport() {
    const csv = buildReportCSV(activeTab, { buckets, incomeBreakdown, categoryData, netWorth: netWorthData })
    const suffix = preset === 'year' ? String(year) : preset
    downloadCSV(`laporan-${activeTab}-${suffix}.csv`, csv)
  }

  return (
    <div className="p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis keuangan · {periodLabel}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {preset === 'year' && (
            <>
              <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <CaretLeft size={16} />
              </button>
              <span className="text-base font-semibold text-gray-900 min-w-[60px] text-center">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <CaretRight size={16} />
              </button>
            </>
          )}
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-gray-900 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Download size={16} />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* P1: Preset periode */}
      <div className="grid grid-cols-4 sm:flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 sm:w-fit">
        {presets.map(p => (
          <button key={p.key} onClick={() => setPreset(p.key)}
            className={`min-w-0 px-1 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center truncate ${
              preset === p.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>{p.label}</button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-4 sm:flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 sm:w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`min-w-0 px-1 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center truncate ${
              activeTab === t.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pemasukan</span>
              <div className="text-xl font-semibold text-emerald-600 mt-1">{formatRp(totalIncome)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pengeluaran</span>
              <div className="text-xl font-semibold text-rose-600 mt-1">{formatRp(totalExpense)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Transfer</span>
              <div className="text-xl font-semibold text-sky-600 mt-1">{formatRp(totalTransfer)}</div>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Arus Kas · {periodLabel}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transfer" name="Transfer" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
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
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
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
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
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
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
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
                  <span className="font-semibold text-gray-900">{formatRp(walletNet)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tren Kekayaan Bersih · {periodLabel}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
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
