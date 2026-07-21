import { useState } from 'react'
import { Plus, PencilSimple, Trash, X, Wallet as WalletIcon, Bank, CreditCard, PiggyBank } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

const walletTypes = [
  { key: 'cash', label: 'Tunai', icon: WalletIcon },
  { key: 'bank', label: 'Rekening Bank', icon: Bank },
  { key: 'credit', label: 'Kartu Kredit', icon: CreditCard },
  { key: 'ewallet', label: 'E-Wallet', icon: PiggyBank },
]

function formatRp(n) {
  return 'Rp ' + Math.abs(n).toLocaleString('id-ID')
}

export default function Wallets() {
  const { loading, wallets, createWallet, updateWallet, deleteWallet } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState(null)

  const [form, setForm] = useState({
    name: '', type: 'cash', balance: '', initial: '', color: '#2563eb',
    active: true, exclude: false, limit: '', dueDate: '', statementDate: '',
  })

  const included = wallets.filter(w => !w.exclude)
  const totalBalance = included.reduce((sum, w) => sum + w.balance, 0)
  const totalAssets = included.filter(w => w.type !== 'credit').reduce((sum, w) => sum + w.balance, 0)
  const totalCredit = included.filter(w => w.type === 'credit').reduce((sum, w) => sum + Math.abs(w.balance), 0)

  function openAdd() {
    setEditId(null)
    setForm({ name: '', type: 'cash', balance: '', initial: '', color: '#2563eb', active: true, exclude: false, limit: '', dueDate: '', statementDate: '' })
    setShowModal(true)
  }

  function openEdit(w) {
    setEditId(w.id)
    setForm({
      name: w.name, type: w.type, balance: String(w.balance), initial: String(w.initial),
      color: w.color, active: w.active, exclude: w.exclude, limit: String(w.limit || ''),
      dueDate: w.dueDate || '', statementDate: w.statementDate || '',
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name, type: form.type, balance: parseInt(form.balance) || 0,
      initial: parseInt(form.initial) || 0, color: form.color, active: form.active, exclude: form.exclude,
      limit: form.type === 'credit' ? parseInt(form.limit) || 0 : undefined,
      dueDate: form.type === 'credit' ? form.dueDate : undefined,
      statementDate: form.type === 'credit' ? form.statementDate : undefined,
    }
    try {
      if (editId) {
        await updateWallet(editId, data)
      } else {
        await createWallet(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteWallet(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  const typeIcon = (type) => {
    const t = walletTypes.find(w => w.key === type)
    return t ? t.icon : WalletIcon
  }

  const typeLabel = (type) => {
    const t = walletTypes.find(w => w.key === type)
    return t ? t.label : type
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dompet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola rekening, tunai, kartu kredit, dan e-wallet</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Dompet
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Total Saldo {wallets.filter(w => w.exclude).length > 0 && <span className="text-amber-500">({wallets.length - included.length} dikecualikan)</span>}
          </span>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{formatRp(totalBalance)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Aset</span>
          <div className="text-2xl font-semibold text-emerald-600 mt-1">{formatRp(totalAssets)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Hutang Kartu</span>
          <div className="text-2xl font-semibold text-rose-600 mt-1">{formatRp(totalCredit)}</div>
        </div>
      </div>

      {/* Wallet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wallets.map((w) => {
          const Icon = typeIcon(w.type)
          const remaining = w.type === 'credit' ? (w.limit - Math.abs(w.balance)) : null
          return (
            <div key={w.id}
              onClick={() => setSelectedWallet(selectedWallet?.id === w.id ? null : w)}
              className={`bg-white rounded-xl border transition-all cursor-pointer ${
                selectedWallet?.id === w.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100 hover:border-gray-200'
              }`}>
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: w.color + '15' }}>
                      <Icon size={20} style={{ color: w.color }} weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{w.name}</div>
                        {w.exclude && <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">Disembunyikan</span>}
                      </div>
                      <div className="text-xs text-gray-400">{typeLabel(w.type)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); openEdit(w) }}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <PencilSimple size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteId(w.id) }}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="px-5 pb-4">
                <div className={`text-xl font-semibold ${w.balance >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                  {w.balance < 0 && '-'}{formatRp(w.balance)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Saldo saat ini</div>
              </div>

              {/* Credit Card Details */}
              {w.type === 'credit' && (
                <div className="px-5 pb-4 space-y-2 border-t border-gray-50 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Limit</span>
                    <span className="text-gray-700 font-medium">{formatRp(w.limit)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sisa Limit</span>
                    <span className={`font-medium ${remaining > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatRp(remaining)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tagihan</span>
                    <span className="text-gray-700 font-medium">{formatRp(Math.abs(w.balance))}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Jatuh Tempo</span>
                    <span className="text-gray-700">{w.dueDate}</span>
                  </div>
                </div>
              )}

              {/* Progress from initial */}
              {w.type !== 'credit' && (
                <div className="px-5 pb-4 pt-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Dari saldo awal</span>
                    <span>{formatRp(w.initial)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: Math.min((w.balance / (w.initial || 1)) * 100, 100) + '%', backgroundColor: w.color }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Panel */}
      {selectedWallet && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Transaksi — {selectedWallet.name}
          </h2>
          <p className="text-sm text-gray-400">(Data transaksi akan diintegrasikan dari API)</p>
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
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Dompet' : 'Tambah Dompet'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Dompet</label>
                <input type="text" placeholder="Contoh: BCA, Tunai, GoPay" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {walletTypes.map(t => {
                    const Icon = t.icon
                    return (
                      <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                          form.type === t.key ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        <Icon size={16} /> {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Saldo Saat Ini</label>
                  <input type="number" placeholder="0" value={form.balance}
                    onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Saldo Awal</label>
                  <input type="number" placeholder="0" value={form.initial}
                    onChange={e => setForm(f => ({ ...f, initial: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Warna</label>
                <div className="flex gap-2">
                  {['#2563eb', '#db2777', '#059669', '#dc2626', '#0891b2', '#ca8a04', '#7c3aed', '#ea580c'].map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {form.type === 'credit' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Limit Kredit</label>
                    <input type="number" placeholder="0" value={form.limit}
                      onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal Tagihan</label>
                      <input type="date" value={form.statementDate}
                        onChange={e => setForm(f => ({ ...f, statementDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jatuh Tempo</label>
                      <input type="date" value={form.dueDate}
                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                  </div>
                </>
              )}
              <label className="flex items-center gap-3 py-2 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, exclude: !f.exclude }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.exclude ? 'bg-gray-300' : 'bg-gray-900'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${form.exclude ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-gray-600">Kecualikan dari dashboard (tidak dijumlah di ringkasan)</span>
              </label>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Dompet?</h3>
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
