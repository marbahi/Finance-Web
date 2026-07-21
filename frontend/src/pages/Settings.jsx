import { useState } from 'react'
import { Download, Trash } from '@phosphor-icons/react'

export default function Settings() {
  const [currency, setCurrency] = useState('IDR')
  const [language, setLanguage] = useState('id')
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('monday')
  const [notifications, setNotifications] = useState(true)
  const [name, setName] = useState('Pengguna')
  const [email, setEmail] = useState('pengguna@email.com')

  return (
    <div className="p-5 font-sans space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sesuaikan aplikasi sesuai kebutuhanmu</p>
      </div>

      <div className="space-y-5">
        {/* Umum */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Preferensi</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Mata Uang</div>
                <div className="text-xs text-gray-400">Format tampilan jumlah uang</div>
              </div>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Bahasa</div>
                <div className="text-xs text-gray-400">Bahasa antarmuka</div>
              </div>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Awal Minggu</div>
                <div className="text-xs text-gray-400">Hari pertama dalam seminggu</div>
              </div>
              <select value={firstDayOfWeek} onChange={e => setFirstDayOfWeek(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="monday">Senin</option>
                <option value="sunday">Minggu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profil */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profil</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              Simpan
            </button>
          </div>
        </div>

        {/* Notifikasi */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Notifikasi</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Pengingat Transaksi Berulang</div>
                <div className="text-xs text-gray-400">Ingatkan saat transaksi berulang jatuh tempo</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <div onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-gray-900' : 'bg-gray-300'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between opacity-40">
              <div>
                <div className="text-sm text-gray-700">Pengingat Tagihan</div>
                <div className="text-xs text-gray-400">Segera hadir</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between opacity-40">
              <div>
                <div className="text-sm text-gray-700">Target Tercapai</div>
                <div className="text-xs text-gray-400">Segera hadir</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Kelola Data</h3>
          <div className="space-y-3">
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={18} className="text-gray-400" />
              <div className="text-left">
                <div className="font-medium">Ekspor Data</div>
                <div className="text-xs text-gray-400">Download semua data ke CSV</div>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">
              <Trash size={18} />
              <div className="text-left">
                <div className="font-medium">Hapus Semua Data</div>
                <div className="text-xs text-rose-400">Hapus permanen semua data transaksi</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tentang */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Tentang</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Aplikasi</span>
              <span className="text-gray-700 font-medium">Finance Monitor</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Versi</span>
              <span className="text-gray-700">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Teknologi</span>
              <span className="text-gray-700">React · Express · SQLite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
