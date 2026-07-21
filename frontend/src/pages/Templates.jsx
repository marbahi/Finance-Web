import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, Copy, FileText } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function Templates() {
  const { loading, templates, categories, wallets, createTemplate, updateTemplate, deleteTemplate } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  const categoryList = useMemo(() => categories.map(c => c.name), [categories])
  const subcategoryList = useMemo(() => {
    const set = new Set()
    categories.forEach(c => c.subcategories?.forEach(s => set.add(s)))
    return [...set]
  }, [categories])
  const walletList = useMemo(() => wallets.map(w => w.name), [wallets])

  const [form, setForm] = useState({
    name: '', type: 'expense', amount: '', category: categoryList[0] || '',
    subcategory: '', wallet: walletList[0] || '', memo: '',
  })

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.category || '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditId(null)
    setForm({ name: '', type: 'expense', amount: '', category: categoryList[0] || '', subcategory: '', wallet: walletList[0] || '', memo: '' })
    setShowModal(true)
  }

  function openEdit(t) {
    setEditId(t.id)
    setForm({
      name: t.name, type: t.type, amount: String(t.amount), category: t.category,
      subcategory: t.subcategory || '', wallet: t.wallet, memo: t.memo || '',
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name, type: form.type, amount: parseInt(form.amount) || 0,
      category: form.category, subcategory: form.subcategory,
      wallet: form.wallet, memo: form.memo,
    }
    try {
      if (editId) {
        await updateTemplate(editId, data)
      } else {
        await createTemplate(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteTemplate(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Template Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Simpan template untuk input transaksi cepat</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Template
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <input type="text" placeholder="Cari template..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'
                }`}>
                  <FileText size={18} className={t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} weight="fill" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  <div className={`text-xs font-medium mt-0.5 ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <PencilSimple size={14} />
                </button>
                <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                  <Trash size={14} />
                </button>
              </div>
            </div>

            <div className={`text-lg font-semibold mb-3 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {t.type === 'income' ? '+' : '-'}{formatRp(t.amount)}
            </div>

            <div className="space-y-1 text-xs text-gray-500">
              <div><span className="text-gray-400">Kategori:</span> {t.category}{t.subcategory ? ` — ${t.subcategory}` : ''}</div>
              <div><span className="text-gray-400">Dompet:</span> {t.wallet}</div>
              {t.memo && <div><span className="text-gray-400">Memo:</span> {t.memo}</div>}
            </div>

            <button
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Copy size={14} />
              Gunakan Template
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Tidak ada template ditemukan</p>
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
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Template' : 'Tambah Template'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Template</label>
                <input type="text" placeholder="Contoh: Makan Siang" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'expense', label: 'Pengeluaran' },
                    { key: 'income', label: 'Pemasukan' },
                  ].map(t => (
                    <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        form.type === t.key ? 'border-gray-900 bg-gray-50 text-gray-900 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah</label>
                <input type="number" placeholder="0" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dompet</label>
                  <select value={form.wallet} onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {walletList.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Memo <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="Catatan tambahan" value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
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

      {/* Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Template?</h3>
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
