import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, CaretDown, CaretRight, MagnifyingGlass } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

export default function Categories() {
  const { loading, categories, createCategory, updateCategory, deleteCategory } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expanded, setExpanded] = useState({})

  const [form, setForm] = useState({
    name: '', type: 'expense', color: '#2563eb', subcategories: '',
  })

  const filtered = categories.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const incomeCount = categories.filter(c => c.type === 'income').length
  const expenseCount = categories.filter(c => c.type === 'expense').length

  function openAdd() {
    setEditId(null)
    setForm({ name: '', type: 'expense', color: '#2563eb', subcategories: '' })
    setShowModal(true)
  }

  function openEdit(c) {
    setEditId(c.id)
    setForm({
      name: c.name, type: c.type, color: c.color,
      subcategories: (c.subcategories || []).join(', '),
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name,
      type: form.type,
      color: form.color,
      subcategories: form.subcategories.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      if (editId) {
        await updateCategory(editId, data)
      } else {
        await createCategory(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteCategory(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">{incomeCount} pemasukan · {expenseCount} pengeluaran</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Kategori
        </button>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3">
        <div className="relative max-w-xs">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Cari kategori..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 w-fit">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'income', label: 'Pemasukan' },
            { key: 'expense', label: 'Pengeluaran' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isExpense = c.type === 'expense'
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color + '15' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{c.name}</div>
                    <div className={`text-[11px] font-medium mt-0.5 ${
                      isExpense ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      {isExpense ? 'Pengeluaran' : 'Pemasukan'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleExpand(c.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {expanded[c.id] ? <CaretDown size={14} /> : <CaretRight size={14} />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(c) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(c.id) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expanded[c.id] && c.subcategories.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Subkategori</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.subcategories.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {expanded[c.id] && c.subcategories.length === 0 && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-400">Tidak ada subkategori</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Tidak ada kategori ditemukan</p>
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
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Kategori</label>
                <input type="text" placeholder="Contoh: Makanan, Gaji" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'income', label: 'Pemasukan' },
                    { key: 'expense', label: 'Pengeluaran' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setForm(f => ({ ...f, type: t.key }))}
                      className={`px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                        form.type === t.key
                          ? 'border-gray-900 bg-gray-50 text-gray-900 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Warna</label>
                <div className="flex gap-2">
                  {['#059669', '#0891b2', '#7c3aed', '#ca8a04', '#dc2626', '#ea580c', '#db2777', '#2563eb', '#be123c', '#4f46e5', '#0d9488', '#78716c'].map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Subkategori <span className="text-gray-400 font-normal">(pisahkan dengan koma)</span>
                </label>
                <input type="text" placeholder="Makan Siang, Makan Malam, Cemilan" value={form.subcategories}
                  onChange={e => setForm(f => ({ ...f, subcategories: e.target.value }))}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Kategori?</h3>
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
