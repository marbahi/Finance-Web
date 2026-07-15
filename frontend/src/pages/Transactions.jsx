import { useState, useMemo, useEffect } from 'react'
import { Plus, Funnel, PencilSimple, Trash, X, CaretUp, CaretDown } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

const today = new Date()
const todayStr = today.toISOString().slice(0, 10)

function getMonthRange(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const end = new Date(y, m + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

function getYearRange(date) {
  const y = date.getFullYear()
  return { start: `${y}-01-01`, end: `${y}-12-31` }
}

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatDate(d) {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Transactions() {
  const { loading, transactions, categories, wallets, createTransaction, updateTransaction, deleteTransaction } = useDummy()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterWallet, setFilterWallet] = useState('all')
  const [period, setPeriod] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const allCategories = useMemo(() => categories.map(c => c.name), [categories])
  const walletNames = useMemo(() => wallets.map(w => w.name), [wallets])
  const subcategoryList = useMemo(() => {
    const set = new Set()
    categories.forEach(c => c.subcategories?.forEach(s => set.add(s)))
    return [...set]
  }, [categories])
  const firstExpenseCat = useMemo(() => categories.find(c => c.type === 'expense')?.name || allCategories[0] || '', [categories, allCategories])
  const firstWallet = walletNames[0] || ''
  const secondWallet = walletNames[1] || walletNames[0] || ''

  const [form, setForm] = useState({
    date: todayStr, type: 'expense', note: '', memo: '', category: firstExpenseCat,
    subcategory: '', amount: '', wallet: firstWallet, transferWallet: secondWallet,
  })

  const categoryOptions = useMemo(
    () => categories.filter(c => c.type === form.type).map(c => c.name),
    [categories, form.type]
  )

  // Update form defaults when data loads
  useEffect(() => {
    if (firstExpenseCat && firstWallet) {
      setForm(f => ({
        ...f,
        category: f.category === '' ? firstExpenseCat : f.category,
        wallet: f.wallet === '' ? firstWallet : f.wallet,
        transferWallet: f.transferWallet === '' ? secondWallet : f.transferWallet,
      }))
    }
  }, [firstExpenseCat, firstWallet, secondWallet])

  const perPage = 15

  const filtered = useMemo(() => {
    let result = [...transactions]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t => t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    }
    if (filterType !== 'all') result = result.filter(t => t.type === filterType)
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory)
    if (filterWallet !== 'all') result = result.filter(t => t.wallet === filterWallet || t.transferWallet === filterWallet)

    if (period === 'today') {
      result = result.filter(t => t.date === todayStr)
    } else if (period === 'month') {
      const { start, end } = getMonthRange(today)
      result = result.filter(t => t.date >= start && t.date <= end)
    } else if (period === 'year') {
      const { start, end } = getYearRange(today)
      result = result.filter(t => t.date >= start && t.date <= end)
    } else if (period === 'custom' && customStart && customEnd) {
      result = result.filter(t => t.date >= customStart && t.date <= customEnd)
    }

    result.sort((a, b) => {
      let cmp
      if (sortField === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortField === 'amount') cmp = a.amount - b.amount
      else if (sortField === 'note') cmp = a.note.localeCompare(b.note)
      else if (sortField === 'category') cmp = a.category.localeCompare(b.category)
      else cmp = 0
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [transactions, search, filterType, filterCategory, filterWallet, period, customStart, customEnd, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function onTypeChange(newType) {
    const valid = categories.filter(c => c.type === newType).map(c => c.name)
    setForm(f => ({
      ...f,
      type: newType,
      category: valid.includes(f.category) ? f.category : (valid[0] || ''),
    }))
  }

  function openAdd() {
    setEditId(null)
    setForm({ date: todayStr, type: 'expense', note: '', memo: '', category: 'Makanan', subcategory: '', amount: '', wallet: 'BCA', transferWallet: 'Mandiri' })
    setShowModal(true)
  }

  function openEdit(t) {
    setEditId(t.id)
    setForm({
      date: t.date, type: t.type, note: t.note, memo: t.memo || '',
      category: t.category, subcategory: t.subcategory || '',
      amount: String(t.amount), wallet: t.wallet,
      transferWallet: t.transferWallet || 'Mandiri',
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      date: form.date, type: form.type, note: form.note, memo: form.memo,
      category: form.category, subcategory: form.subcategory,
      amount: parseInt(form.amount) || 0, wallet: form.wallet,
      transferWallet: form.type === 'transfer' ? form.transferWallet : '',
    }
    try {
      if (editId) {
        await updateTransaction(editId, data)
      } else {
        await createTransaction(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteTransaction(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <CaretUp size={12} className="inline ml-0.5" /> : <CaretDown size={12} className="inline ml-0.5" />
  }

  if (loading) {
    return (
      <div className="p-5 font-sans flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-gray-400">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} total transaksi</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Transaksi
        </button>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Cari..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="all">Semua Tipe</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="transfer">Transfer</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              showFilters ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <Funnel size={14} />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap p-3 bg-gray-50 rounded-lg">
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
              <option value="all">Semua Kategori</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterWallet} onChange={e => { setFilterWallet(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
              <option value="all">Semua Dompet</option>
              {walletNames.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        )}

        {/* Period Buttons */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 w-fit">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'today', label: 'Hari Ini' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'year', label: 'Tahun Ini' },
            { key: 'custom', label: 'Kustom' },
          ].map(p => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}>{p.label}</button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <span className="text-xs text-gray-400">sampai</span>
            <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th onClick={() => toggleSort('date')} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                  Tanggal <SortIcon field="date" />
                </th>
                <th onClick={() => toggleSort('note')} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                  Catatan <SortIcon field="note" />
                </th>
                <th onClick={() => toggleSort('category')} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                  Kategori <SortIcon field="category" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Dompet</th>
                <th onClick={() => toggleSort('amount')} className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                  Jumlah <SortIcon field="amount" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{t.note}</div>
                    {t.memo && <div className="text-xs text-gray-400">{t.memo}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.category}{t.subcategory ? ` — ${t.subcategory}` : ''}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="text-gray-500">{t.wallet}</span>
                    {t.transferWallet && <span className="text-gray-400"> → {t.transferWallet}</span>}
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold text-right ${
                    t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-rose-600' : 'text-gray-600'
                  }`}>
                    {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatRp(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <PencilSimple size={14} />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paged.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Tidak ada transaksi</p>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                page === p ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>{p}</button>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'expense', label: 'Pengeluaran' },
                    { key: 'income', label: 'Pemasukan' },
                    { key: 'transfer', label: 'Transfer' },
                  ].map(t => (
                    <button key={t.key} onClick={() => onTypeChange(t.key)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        form.type === t.key ? 'border-gray-900 bg-gray-50 text-gray-900 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Catatan</label>
                <input type="text" placeholder="Contoh: Makan Siang" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Memo <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="Catatan tambahan" value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Subkategori</label>
                  <select value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    <option value="">Tidak ada</option>
                    {subcategoryList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah</label>
                <input type="number" placeholder="0" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dompet</label>
                <select value={form.wallet} onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                  {walletNames.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              {form.type === 'transfer' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dompet Tujuan</label>
                  <select value={form.transferWallet} onChange={e => setForm(f => ({ ...f, transferWallet: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {walletNames.filter(w => w !== form.wallet).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={save} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-gray-500">Data yang sudah dihapus tidak dapat dikembalikan.</p>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
