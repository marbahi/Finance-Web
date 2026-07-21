import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const today = new Date()

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const categoryColors = {
  'Makanan': '#dc2626', 'Transportasi': '#ea580c', 'Belanja': '#db2777',
  'Hiburan': '#2563eb', 'Kesehatan': '#be123c', 'Tagihan': '#4f46e5',
  'Pendidikan': '#0d9488', 'Lain-lain': '#78716c', 'Gaji': '#059669',
  'Investasi': '#7c3aed', 'Freelance': '#0891b4',
}

export default function Budgets() {
  const { loading, budgets, transactions, categories, createBudget, updateBudget, deleteBudget } = useDummy()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [form, setForm] = useState({
    category: '', amount: '',
  })

  const filtered = budgets.filter(b => b.month === month && b.year === year)

  const spentByCategory = useMemo(() => {
    const map = {}
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    transactions.forEach(t => {
      if (t.type !== 'expense') return
      if (!t.date.startsWith(monthStr)) return
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return map
  }, [transactions, month, year])

  const enriched = filtered.map(b => ({
    ...b,
    spent: spentByCategory[b.category] || 0,
  }))

  const expenseCategoryNames = useMemo(() => categories.filter(c => c.type === 'expense').map(c => c.name), [categories])
  const expenseCategories = expenseCategoryNames.length > 0 ? expenseCategoryNames : ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Pendidikan', 'Lain-lain']

  const totalBudget = enriched.reduce((s, b) => s + b.amount, 0)
  const totalSpent = enriched.reduce((s, b) => s + b.spent, 0)

  function openAdd() {
    setEditId(null)
    setForm({ category: expenseCategories[0], amount: '' })
    setShowModal(true)
  }

  function openEdit(b) {
    setEditId(b.id)
    setForm({ category: b.category, amount: String(b.amount) })
    setShowModal(true)
  }

  async function save() {
    const data = {
      category: form.category,
      amount: parseInt(form.amount) || 0,
      month, year,
    }
    try {
      if (editId) {
        await updateBudget(editId, data)
      } else {
        if (budgets.some(b => b.category === data.category && b.month === month && b.year === year)) return
        await createBudget(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteBudget(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Anggaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola batas pengeluaran per kategori</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-base font-semibold text-gray-900 min-w-[140px] text-center">
            {months[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400">Anggaran</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">{formatRp(totalBudget)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400">Terpakai</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">{formatRp(totalSpent)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400">Sisa</div>
          <div className={`text-lg font-semibold mt-1 ${totalBudget - totalSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatRp(totalBudget - totalSpent)}
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-3">
        {enriched.map((b) => {
          const pct = Math.min((b.spent / b.amount) * 100, 100)
          const color = categoryColors[b.category] || '#78716c'
          const overBudget = b.spent > b.amount
          return (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{b.category}</span>
                    <span className="text-xs text-gray-400 ml-2">Anggaran {formatRp(b.amount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatRp(b.spent)}</div>
                    <div className={`text-xs ${overBudget ? 'text-rose-500' : 'text-gray-400'}`}>
                      {overBudget ? `${formatRp(b.spent - b.amount)} kelebihan` : `Sisa ${formatRp(b.amount - b.spent)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <PencilSimple size={14} />
                    </button>
                    <button onClick={() => setDeleteId(b.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overBudget ? 'bg-rose-500' : 'bg-gray-900'}`}
                  style={{ width: pct + '%' }} />
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Belum ada anggaran untuk bulan ini</p>
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={openAdd}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
        <Plus size={24} weight="bold" />
      </button>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Anggaran' : 'Tambah Anggaran'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                  {expenseCategories.map(c => (
                    <option key={c} value={c} disabled={budgets.some(b => b.category === c && b.month === month && b.year === year && b.id !== editId)}>
                      {c} {budgets.some(b => b.category === c && b.month === month && b.year === year && b.id !== editId) ? '(sudah ada)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah Anggaran</label>
                <input type="number" placeholder="0" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Anggaran?</h3>
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
