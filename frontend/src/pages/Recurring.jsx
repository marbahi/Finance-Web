import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, Repeat, Pause, Play } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

const frequencies = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
]

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function Recurring() {
  const { loading, recurring, categories, wallets, createRecurring, updateRecurring, deleteRecurring, toggleRecurring } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const categoryList = useMemo(() => categories.map(c => c.name), [categories])
  const walletList = useMemo(() => wallets.map(w => w.name), [wallets])

  const [form, setForm] = useState({
    name: '', type: 'expense', amount: '', category: categoryList[0] || '',
    wallet: walletList[0] || '', frequency: 'monthly', nextDate: '', note: '',
  })

  const filtered = recurring.filter(i => {
    if (filterType === 'active') return i.status === 'active'
    if (filterType === 'paused') return i.status === 'paused'
    return true
  })

  const monthlyTotal = recurring.filter(i => i.status === 'active').reduce((s, i) => {
    const mult = i.frequency === 'yearly' ? 1 / 12 : i.frequency === 'weekly' ? 4.33 : i.frequency === 'daily' ? 30 : 1
    return s + i.amount * mult
  }, 0)

  function openAdd() {
    setEditId(null)
    setForm({ name: '', type: 'expense', amount: '', category: categoryList[0] || '', wallet: walletList[0] || '', frequency: 'monthly', nextDate: '', note: '' })
    setShowModal(true)
  }

  function openEdit(i) {
    setEditId(i.id)
    setForm({
      name: i.name, type: i.type, amount: String(i.amount), category: i.category,
      wallet: i.wallet, frequency: i.frequency, nextDate: i.nextDate, note: i.note || '',
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name, type: form.type, amount: parseInt(form.amount) || 0,
      category: form.category, wallet: form.wallet, frequency: form.frequency,
      nextDate: form.nextDate, note: form.note,
      status: editId ? recurring.find(i => i.id === editId)?.status || 'active' : 'active',
    }
    try {
      if (editId) {
        await updateRecurring(editId, data)
      } else {
        await createRecurring(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteRecurring(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  async function toggleStatus(id) {
    try {
      await toggleRecurring(id)
    } catch (e) {
      alert('Gagal mengubah status: ' + e.message)
    }
  }

  const freqLabel = (f) => frequencies.find(fr => fr.key === f)?.label || f

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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Transaksi Berulang</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur pemasukan dan pengeluaran rutin</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Berulang
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Estimasi Pengeluaran Bulanan (Aktif)</span>
        <div className="text-2xl font-semibold text-gray-900 mt-1">{formatRp(Math.round(monthlyTotal))}</div>
        <div className="text-xs text-gray-400 mt-1">{recurring.filter(i => i.status === 'active').length} transaksi aktif · {recurring.filter(i => i.status === 'paused').length} dijeda</div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 w-fit">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'active', label: 'Aktif' },
          { key: 'paused', label: 'Dijeda' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Recurring Items */}
      <div className="space-y-3">
        {filtered.map((i) => (
          <div key={i.id} className={`bg-white rounded-xl border transition-all p-5 ${
            i.status === 'paused' ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  i.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'
                }`}>
                  <Repeat size={18} className={i.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} weight="bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{i.name}</span>
                    {i.status === 'paused' && <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">Dijeda</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {freqLabel(i.frequency)} · {i.category} · {i.wallet}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className={`text-sm font-semibold ${i.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {i.type === 'income' ? '+' : '-'}{formatRp(i.amount)}
                  </div>
                  <div className="text-xs text-gray-400">Berikutnya: {i.nextDate}</div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => toggleStatus(i.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      i.status === 'active' ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                    }`}>
                    {i.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => openEdit(i)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <PencilSimple size={14} />
                  </button>
                  <button onClick={() => setDeleteId(i.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            </div>
            {i.note && <div className="text-xs text-gray-400 mt-2 italic">{i.note}</div>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Tidak ada transaksi berulang</p>
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
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit' : 'Tambah'} Transaksi Berulang</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama</label>
                <input type="text" placeholder="Contoh: Netflix, Gaji" value={form.name}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah</label>
                  <input type="number" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Frekuensi</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {frequencies.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
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
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dompet</label>
                  <select value={form.wallet} onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    {walletList.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal Berikutnya</label>
                <input type="date" value={form.nextDate}
                  onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="Catatan tambahan" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Transaksi Berulang?</h3>
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
