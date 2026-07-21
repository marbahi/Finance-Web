import { useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, X, PiggyBank, House, AirplaneTilt, GraduationCap, Car, Heart, Star, Coin } from '@phosphor-icons/react'
import { useDummy } from '../data/DummyContext'

const goalIcons = [
  { key: 'piggy', icon: PiggyBank, label: 'Tabungan' },
  { key: 'house', icon: House, label: 'Rumah' },
  { key: 'plane', icon: AirplaneTilt, label: 'Liburan' },
  { key: 'education', icon: GraduationCap, label: 'Pendidikan' },
  { key: 'car', icon: Car, label: 'Kendaraan' },
  { key: 'heart', icon: Heart, label: 'Kesehatan' },
  { key: 'star', icon: Star, label: 'Lainnya' },
]

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function Goals() {
  const { loading, goals, wallets, createGoal, updateGoal, deleteGoal, addGoalFund } = useDummy()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [fundModal, setFundModal] = useState(null)

  const walletNames = useMemo(() => wallets.map(w => w.name), [wallets])

  const [form, setForm] = useState({
    name: '', icon: 'piggy', target: '', current: '', deadline: '', color: '#2563eb', note: '',
  })

  const [fundForm, setFundForm] = useState({
    amount: '', wallet: walletNames[0] || '', date: new Date().toISOString().slice(0, 10),
  })

  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0)

  function openAdd() {
    setEditId(null)
    setForm({ name: '', icon: 'piggy', target: '', current: '0', deadline: '', color: '#2563eb', note: '' })
    setShowModal(true)
  }

  function openEdit(g) {
    setEditId(g.id)
    setForm({
      name: g.name, icon: g.icon, target: String(g.target), current: String(g.current),
      deadline: g.deadline, color: g.color, note: g.note || '',
    })
    setShowModal(true)
  }

  async function save() {
    const data = {
      name: form.name, icon: form.icon, target: parseInt(form.target) || 0,
      current: parseInt(form.current) || 0, deadline: form.deadline,
      color: form.color, note: form.note,
    }
    try {
      if (editId) {
        await updateGoal(editId, data)
      } else {
        await createGoal(data)
      }
      setShowModal(false)
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message)
    }
  }

  async function confirmDelete() {
    try {
      await deleteGoal(deleteId)
      setDeleteId(null)
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  function openFund(g) {
    setFundModal(g)
    setFundForm({
      amount: String(g.target - g.current),
      wallet: walletNames[0] || '',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  async function confirmFund() {
    if (!fundModal) return
    const amount = parseInt(fundForm.amount)
    if (!amount || amount <= 0) return
    try {
      await addGoalFund(fundModal.id, fundForm.wallet, amount, fundForm.date)
      setFundModal(null)
    } catch (e) {
      alert('Gagal menambah dana: ' + e.message)
    }
  }

  function getIcon(iconKey) {
    const found = goalIcons.find(i => i.key === iconKey)
    return found ? found.icon : PiggyBank
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Target</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pantau progres target keuanganmu</p>
        </div>
        <button onClick={openAdd}
          className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} weight="bold" />
          Tambah Target
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Target</span>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{formatRp(totalTarget)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Terkumpul</span>
          <div className="text-2xl font-semibold text-emerald-600 mt-1">{formatRp(totalCurrent)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sisa</span>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{formatRp(totalTarget - totalCurrent)}</div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map((g) => {
          const Icon = getIcon(g.icon)
          const pct = Math.min((g.current / g.target) * 100, 100)
          const achieved = g.current >= g.target
          const remaining = Math.max(g.target - g.current, 0)
          return (
            <div key={g.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${
              achieved ? 'border-emerald-200' : 'border-gray-100 hover:border-gray-200'
            }`}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: g.color + '15' }}>
                      <Icon size={20} style={{ color: g.color }} weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{g.name}</span>
                        {achieved && <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">Tercapai</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {g.deadline ? new Date(g.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanpa deadline'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(g)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <PencilSimple size={14} />
                    </button>
                    <button onClick={() => setDeleteId(g.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{formatRp(g.current)}</div>
                      <div className="text-xs text-gray-400">dari {formatRp(g.target)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{Math.round(pct)}%</div>
                      {!achieved && <div className="text-xs text-gray-400">Sisa {formatRp(remaining)}</div>}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${achieved ? 'bg-emerald-500' : 'bg-gray-900'}`}
                      style={{ width: pct + '%' }} />
                  </div>
                </div>

                {!achieved && (
                  <button onClick={() => openFund(g)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Coin size={14} />
                    Tambah Dana
                  </button>
                )}

                {g.note && <div className="text-xs text-gray-400 mt-3 italic">{g.note}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Belum ada target keuangan</p>
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={openAdd}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
        <Plus size={24} weight="bold" />
      </button>

      {/* Fund Modal */}
      {fundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setFundModal(null)}>
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Tambah Dana — {fundModal.name}</h2>
              <button onClick={() => setFundModal(null)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PiggyBank size={18} className="text-gray-500" />
                <div className="text-sm text-gray-600">
                  Sisa target: <span className="font-semibold text-gray-900">{formatRp(fundModal.target - fundModal.current)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah</label>
                <input type="number" placeholder="0" value={fundForm.amount}
                  onChange={e => setFundForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dompet Sumber</label>
                <select value={fundForm.wallet} onChange={e => setFundForm(f => ({ ...f, wallet: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                  {walletNames.map(w => (
                    <option key={w} value={w}>{w} ({formatRp(wallets.find(x => x.name === w)?.balance || 0)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal</label>
                <input type="date" value={fundForm.date}
                  onChange={e => setFundForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Dana akan berkurang dari dompet {fundForm.wallet} dan dicatat sebagai pengeluaran.
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setFundModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={confirmFund} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Target' : 'Tambah Target'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Target</label>
                <input type="text" placeholder="Contoh: DP Rumah, Liburan" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Ikon</label>
                <div className="flex gap-2 flex-wrap">
                  {goalIcons.map(i => {
                    const Icon = i.icon
                    return (
                      <button key={i.key} onClick={() => setForm(f => ({ ...f, icon: i.key }))}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          form.icon === i.key ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        <Icon size={16} /> {i.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target</label>
                  <input type="number" placeholder="0" value={form.target}
                    onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Terkumpul</label>
                  <input type="number" placeholder="0" value={form.current}
                    onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Deadline <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Warna</label>
                <div className="flex gap-2">
                  {['#2563eb', '#0891b2', '#059669', '#ea580c', '#7c3aed', '#db2777', '#ca8a04', '#dc2626'].map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Target?</h3>
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
