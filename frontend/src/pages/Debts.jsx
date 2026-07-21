import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, ArrowRight, CurrencyDollar } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function Debts() {
  const { loading, debts, wallets, createDebt, updateDebt, deleteDebt, addDebtPayment } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [payModal, setPayModal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const walletNames = useMemo(() => wallets.map(w => w.name), [wallets])

  const [form, setForm] = useState({
    name: '', type: 'debt', person: '', amount: '', paid: '', dueDate: '', note: '', status: 'active',
  })

  const [payForm, setPayForm] = useState({
    amount: '', wallet: walletNames[0] || '', date: new Date().toISOString().slice(0, 10), note: '',
  })

  const filtered = debts.filter(d => {
    if (filterStatus === 'active') return d.status === 'active'
    if (filterStatus === 'paid') return d.status === 'paid'
    return true
  })

  const activeDebts = debts.filter(d => d.type === 'debt' && d.status === 'active')
  const activeReceivables = debts.filter(d => d.type === 'receivable' && d.status === 'active')
  const totalDebt = activeDebts.reduce((s, d) => s + (d.amount - d.paid), 0)
  const totalReceivable = activeReceivables.reduce((s, d) => s + (d.amount - d.paid), 0)

  function openAdd() {
    setEditId(null)
    setForm({ name: '', type: 'debt', person: '', amount: '', paid: '0', dueDate: '', note: '', status: 'active' })
    setShowModal(true)
  }

  function openEdit(d) {
    setEditId(d.id)
    setForm({
      name: d.name, type: d.type, person: d.person, amount: String(d.amount),
      paid: String(d.paid), dueDate: d.dueDate, note: d.note || '', status: d.status,
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name, type: form.type, person: form.person,
      amount: parseInt(form.amount) || 0, paid: parseInt(form.paid) || 0,
      dueDate: form.dueDate, note: form.note, status: form.status,
    }
    try {
      if (editId) {
        await updateDebt(editId, data)
      } else {
        await createDebt(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteDebt(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  async function toggleStatus(id) {
    const debt = debts.find(d => d.id === id)
    if (!debt) return
    try {
      await updateDebt(id, { status: debt.status === 'active' ? 'paid' : 'active' })
    } catch (e) {
      alert('Gagal mengubah status: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="p-5 font-sans flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-gray-400">Memuat data...</div>
      </div>
    )
  }

  function openPay(d) {
    setPayModal(d)
    const remaining = d.amount - d.paid
    setPayForm({
      amount: String(remaining),
      wallet: walletNames[0] || '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
    })
  }

  async function confirmPay() {
    if (!payModal) return
    const amount = parseInt(payForm.amount)
    if (!amount || amount <= 0) return
    const remaining = payModal.amount - payModal.paid
    const payAmount = Math.min(amount, remaining)
    try {
      await addDebtPayment(payModal.id, payForm.wallet, payAmount, payForm.date, payForm.note)
      setPayModal(null)
    } catch (e) {
      alert('Gagal memproses pembayaran: ' + e.message)
    }
  }

  return (
    <div className="p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Hutang / Piutang</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catat pinjaman dan piutang</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sisa Hutang Aktif</span>
          <div className="text-2xl font-semibold text-rose-600 mt-1">{formatRp(totalDebt)}</div>
          <div className="text-xs text-gray-400 mt-1">{activeDebts.length} hutang aktif</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sisa Piutang Aktif</span>
          <div className="text-2xl font-semibold text-emerald-600 mt-1">{formatRp(totalReceivable)}</div>
          <div className="text-xs text-gray-400 mt-1">{activeReceivables.length} piutang aktif</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 w-fit">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'active', label: 'Aktif' },
          { key: 'paid', label: 'Lunas' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Debt List */}
      <div className="space-y-3">
        {filtered.map((d) => {
          const remaining = d.amount - d.paid
          const pct = (d.paid / d.amount) * 100
          const overdue = d.status === 'active' && new Date(d.dueDate) < new Date()
          const isActive = d.status === 'active'
          return (
            <div key={d.id} className={`bg-white rounded-xl border transition-all p-5 ${
              d.status === 'paid' ? 'border-green-100 opacity-60' : overdue ? 'border-rose-200' : 'border-gray-100'
            }`}>
              {/* Top: icon + name (left) | action buttons (right) */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    d.type === 'debt' ? 'bg-rose-50' : 'bg-emerald-50'
                  }`}>
                    <ArrowRight size={18} className={d.type === 'debt' ? 'text-rose-500' : 'text-emerald-500'} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 truncate">{d.name}</span>
                      {d.status === 'paid' && <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">Lunas</span>}
                      {overdue && <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-medium shrink-0">Terlambat</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{d.person}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isActive && (
                    <button onClick={() => openPay(d)}
                      className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title={d.type === 'debt' ? 'Bayar' : 'Terima'}>
                      <CurrencyDollar size={14} />
                    </button>
                  )}
                  <button onClick={() => toggleStatus(d.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      d.status === 'active' ? 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={d.status === 'active' ? 'Tandai Lunas' : 'Aktifkan kembali'}>
                    <span className={`w-3 h-3 rounded-full block ${d.status === 'paid' ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                  </button>
                  <button onClick={() => openEdit(d)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <PencilSimple size={14} />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              {/* Amount + Progress */}
              <div className="mt-3">
                <div className={`text-sm font-semibold ${d.type === 'debt' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatRp(remaining)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{d.type === 'debt' ? 'Hutang' : 'Piutang'}</div>
                <div className="flex justify-between text-xs text-gray-400 mt-3 mb-1">
                  <span>Terkumpul {formatRp(d.paid)}</span>
                  <span>Target {formatRp(d.amount)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.type === 'debt' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: pct + '%' }} />
                </div>
              </div>

              {d.dueDate && (
                <div className="text-xs text-gray-400 mt-2">
                  Jatuh tempo: {new Date(d.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {d.note && <div className="text-xs text-gray-400 mt-1 italic">{d.note}</div>}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Tidak ada data</p>
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={openAdd}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
        <Plus size={24} weight="bold" />
      </button>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setPayModal(null)}>
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {payModal.type === 'debt' ? 'Bayar Hutang' : 'Terima Piutang'}
              </h2>
              <button onClick={() => setPayModal(null)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${payModal.type === 'debt' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                  <ArrowRight size={16} className={payModal.type === 'debt' ? 'text-rose-500' : 'text-emerald-500'} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{payModal.name}</div>
                  <div className="text-xs text-gray-400">Sisa: {formatRp(payModal.amount - payModal.paid)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah</label>
                <input type="number" placeholder="0" value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {payModal.type === 'debt' ? 'Dompet Asal' : 'Dompet Tujuan'}
                </label>
                <select value={payForm.wallet} onChange={e => setPayForm(f => ({ ...f, wallet: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                  {walletNames.map(w => (
                    <option key={w} value={w}>{w} ({formatRp(wallets.find(x => x.name === w)?.balance || 0)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal</label>
                <input type="date" value={payForm.date}
                  onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="Catatan" value={payForm.note}
                  onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setPayModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={confirmPay} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                {payModal.type === 'debt' ? 'Bayar' : 'Terima'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit' : 'Tambah'} Hutang / Piutang</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama</label>
                <input type="text" placeholder="Contoh: Pinjaman Budi" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'debt', label: 'Hutang (saya berhutang)' },
                    { key: 'receivable', label: 'Piutang (orang berhutang)' },
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Orang / Institusi</label>
                <input type="text" placeholder="Contoh: Budi Santoso, BCA" value={form.person}
                  onChange={e => setForm(f => ({ ...f, person: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah Total</label>
                  <input type="number" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Sudah Dibayar</label>
                  <input type="number" placeholder="0" value={form.paid}
                    onChange={e => setForm(f => ({ ...f, paid: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jatuh Tempo</label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Data?</h3>
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
