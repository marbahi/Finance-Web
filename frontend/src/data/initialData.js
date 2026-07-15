export const dummyTrans = [
  { id: 1, date: '2026-07-14', note: 'Gaji Bulanan', memo: '', type: 'income', amount: 7500000, category: 'Gaji', subcategory: '', wallet: 'BCA', transferWallet: '' },
  { id: 2, date: '2026-07-14', note: 'Makan Siang', memo: 'Nasi Padang', type: 'expense', amount: 45000, category: 'Makanan', subcategory: 'Makan Siang', wallet: 'Tunai', transferWallet: '' },
  { id: 3, date: '2026-07-13', note: 'Bensin', memo: '', type: 'expense', amount: 150000, category: 'Transportasi', subcategory: 'Bensin', wallet: 'Tunai', transferWallet: '' },
  { id: 4, date: '2026-07-12', note: 'Transfer ke Tabungan', memo: '', type: 'transfer', amount: 500000, category: 'Transfer', subcategory: '', wallet: 'BCA', transferWallet: 'Mandiri' },
  { id: 5, date: '2026-07-11', note: 'Belanja Bulanan', memo: 'Indomaret', type: 'expense', amount: 350000, category: 'Belanja', subcategory: 'Sembako', wallet: 'BCA', transferWallet: '' },
  { id: 6, date: '2026-07-10', note: 'Gaji Freelance', memo: 'Project Web', type: 'income', amount: 1500000, category: 'Gaji', subcategory: '', wallet: 'Mandiri', transferWallet: '' },
  { id: 7, date: '2026-07-09', note: 'Parkir', memo: '', type: 'expense', amount: 5000, category: 'Transportasi', subcategory: 'Parkir', wallet: 'Tunai', transferWallet: '' },
  { id: 8, date: '2026-07-08', note: 'Netflix', memo: 'Monthly', type: 'expense', amount: 159000, category: 'Hiburan', subcategory: 'Streaming', wallet: 'BCA', transferWallet: '' },
  { id: 9, date: '2026-07-07', note: 'Warung Makan', memo: '', type: 'expense', amount: 25000, category: 'Makanan', subcategory: 'Makan Malam', wallet: 'Tunai', transferWallet: '' },
  { id: 10, date: '2026-07-06', note: 'Pulsa', memo: '', type: 'expense', amount: 50000, category: 'Lainnya', subcategory: 'Pulsa', wallet: 'BCA', transferWallet: '' },
  { id: 11, date: '2026-07-05', note: 'Bonus Proyek', memo: '', type: 'income', amount: 2000000, category: 'Gaji', subcategory: '', wallet: 'BCA', transferWallet: '' },
  { id: 12, date: '2026-07-04', note: 'Mie Ayam', memo: '', type: 'expense', amount: 15000, category: 'Makanan', subcategory: 'Makan Siang', wallet: 'Tunai', transferWallet: '' },
  { id: 13, date: '2026-06-28', note: 'Tagihan Listrik', memo: 'PLN', type: 'expense', amount: 320000, category: 'Lainnya', subcategory: 'Listrik', wallet: 'BCA', transferWallet: '' },
  { id: 14, date: '2026-06-15', note: 'Gaji Bulanan', memo: '', type: 'income', amount: 7500000, category: 'Gaji', subcategory: '', wallet: 'BCA', transferWallet: '' },
  { id: 15, date: '2026-06-10', note: 'Service Motor', memo: 'Bengkel ABC', type: 'expense', amount: 450000, category: 'Transportasi', subcategory: 'Servis', wallet: 'Mandiri', transferWallet: '' },
]

export const dummyWallets = [
  { id: 1, name: 'BCA', type: 'bank', balance: 12500000, initial: 10000000, color: '#2563eb', icon: 'Bank', active: true, exclude: false },
  { id: 2, name: 'Mandiri', type: 'bank', balance: 5400000, initial: 5000000, color: '#db2777', icon: 'Bank', active: true, exclude: false },
  { id: 3, name: 'Tunai', type: 'cash', balance: 850000, initial: 500000, color: '#059669', icon: 'Wallet', active: true, exclude: false },
  { id: 4, name: 'BCA Kartu Kredit', type: 'credit', balance: -2250000, initial: 0, color: '#dc2626', icon: 'CreditCard', active: true, exclude: false, limit: 10000000, dueDate: '2026-08-10', statementDate: '2026-07-15' },
  { id: 5, name: 'Dana', type: 'ewallet', balance: 350000, initial: 0, color: '#0891b2', icon: 'Wallet', active: true, exclude: false },
]

export const dummyCategories = [
  { id: 1, name: 'Gaji', type: 'income', color: '#059669', subcategories: ['Gaji Pokok', 'Bonus', 'Lembur'] },
  { id: 2, name: 'Freelance', type: 'income', color: '#0891b2', subcategories: ['Project Web', 'Design', 'Konsultan'] },
  { id: 3, name: 'Investasi', type: 'income', color: '#7c3aed', subcategories: ['Dividen', 'Bunga', 'Crypto'] },
  { id: 4, name: 'Lain-lain', type: 'income', color: '#ca8a04', subcategories: ['Hadiah', 'Asuransi', 'Refund'] },
  { id: 5, name: 'Makanan', type: 'expense', color: '#dc2626', subcategories: ['Makan Siang', 'Makan Malam', 'Sarapan', 'Cemilan'] },
  { id: 6, name: 'Transportasi', type: 'expense', color: '#ea580c', subcategories: ['Bensin', 'Parkir', 'Tol', 'Angkutan Umum'] },
  { id: 7, name: 'Belanja', type: 'expense', color: '#db2777', subcategories: ['Sembako', 'Pakaian', 'Elektronik', 'Alat Rumah'] },
  { id: 8, name: 'Hiburan', type: 'expense', color: '#2563eb', subcategories: ['Streaming', 'Film', 'Game', 'Konser'] },
  { id: 9, name: 'Kesehatan', type: 'expense', color: '#be123c', subcategories: ['Obat', 'Dokter', 'Cek Lab'] },
  { id: 10, name: 'Tagihan', type: 'expense', color: '#4f46e5', subcategories: ['Listrik', 'Air', 'Internet', 'Pulsa'] },
  { id: 11, name: 'Pendidikan', type: 'expense', color: '#0d9488', subcategories: ['Kursus', 'Buku', 'Alat Tulis'] },
  { id: 12, name: 'Lain-lain', type: 'expense', color: '#78716c', subcategories: ['Iuran', 'Donasi', 'Paket'] },
]

export const dummyBudgets = [
  { id: 1, category: 'Makanan', amount: 1500000, month: 6, year: 2026 },
  { id: 2, category: 'Transportasi', amount: 600000, month: 6, year: 2026 },
  { id: 3, category: 'Belanja', amount: 1000000, month: 6, year: 2026 },
  { id: 4, category: 'Hiburan', amount: 300000, month: 6, year: 2026 },
  { id: 5, category: 'Tagihan', amount: 800000, month: 6, year: 2026 },
  { id: 6, category: 'Kesehatan', amount: 400000, month: 6, year: 2026 },
  { id: 7, category: 'Pendidikan', amount: 500000, month: 6, year: 2026 },
  { id: 8, category: 'Lain-lain', amount: 300000, month: 6, year: 2026 },
]

export const dummyDebts = [
  { id: 1, name: 'Pinjaman Budi', type: 'debt', person: 'Budi Santoso', amount: 2000000, paid: 500000, dueDate: '2026-09-15', note: 'Pinjam bulan Maret', status: 'active' },
  { id: 2, name: 'Kartu Kredit BCA', type: 'debt', person: 'BCA', amount: 2250000, paid: 250000, dueDate: '2026-08-10', note: 'Tagihan Juli', status: 'active' },
  { id: 3, name: 'Pinjaman Bank', type: 'debt', person: 'Mandiri', amount: 12000000, paid: 3000000, dueDate: '2027-06-01', note: 'Kredit kendaraan', status: 'active' },
  { id: 4, name: 'Piutang Andi', type: 'receivable', person: 'Andi Wijaya', amount: 1500000, paid: 1500000, dueDate: '2026-05-20', note: 'Bayar project web', status: 'paid' },
  { id: 5, name: 'Piutang Siska', type: 'receivable', person: 'Siska Dewi', amount: 800000, paid: 0, dueDate: '2026-08-25', note: 'Titip belanja', status: 'active' },
  { id: 6, name: 'Pinjaman Rudi', type: 'debt', person: 'Rudi Hermawan', amount: 500000, paid: 500000, dueDate: '2026-07-01', note: '', status: 'paid' },
]

export const dummyGoals = [
  { id: 1, name: 'DP Rumah', icon: 'house', target: 50000000, current: 12500000, deadline: '2027-12-31', color: '#2563eb', note: 'Uang muka rumah idaman' },
  { id: 2, name: 'Liburan Jepang', icon: 'plane', target: 15000000, current: 4500000, deadline: '2027-06-30', color: '#0891b2', note: 'Liburan ke Tokyo' },
  { id: 3, name: 'Dana Darurat', icon: 'piggy', target: 10000000, current: 10000000, deadline: '2026-08-01', color: '#059669', note: '6 bulan pengeluaran' },
  { id: 4, name: 'Mobil Baru', icon: 'car', target: 200000000, current: 35000000, deadline: '2028-12-31', color: '#ea580c', note: '' },
  { id: 5, name: 'Kursus Data Science', icon: 'education', target: 5000000, current: 1500000, deadline: '2026-10-01', color: '#7c3aed', note: '' },
]

export const dummyRecurring = [
  { id: 1, name: 'Netflix', type: 'expense', amount: 159000, category: 'Hiburan', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-08', status: 'active', note: 'Family plan' },
  { id: 2, name: 'Spotify', type: 'expense', amount: 55000, category: 'Hiburan', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-15', status: 'active', note: '' },
  { id: 3, name: 'Gaji Bulanan', type: 'income', amount: 7500000, category: 'Gaji', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-01', status: 'active', note: 'PT Maju Jaya' },
  { id: 4, name: 'Listrik', type: 'expense', amount: 350000, category: 'Tagihan', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-20', status: 'active', note: 'PLN' },
  { id: 5, name: 'Internet', type: 'expense', amount: 300000, category: 'Tagihan', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-05', status: 'active', note: 'Biznet' },
  { id: 6, name: 'Nabung Saham', type: 'expense', amount: 500000, category: 'Investasi', wallet: 'Mandiri', frequency: 'monthly', nextDate: '2026-08-10', status: 'paused', note: '' },
  { id: 7, name: 'Asuransi', type: 'expense', amount: 250000, category: 'Kesehatan', wallet: 'BCA', frequency: 'monthly', nextDate: '2026-08-25', status: 'active', note: 'AXA Mandiri' },
]

export const dummyTemplates = [
  { id: 1, name: 'Gaji Bulanan', type: 'income', amount: 7500000, category: 'Gaji', subcategory: 'Gaji Pokok', wallet: 'BCA', memo: 'PT Maju Jaya' },
  { id: 2, name: 'Makan Siang', type: 'expense', amount: 45000, category: 'Makanan', subcategory: 'Makan Siang', wallet: 'Tunai', memo: '' },
  { id: 3, name: 'Bensin', type: 'expense', amount: 150000, category: 'Transportasi', subcategory: 'Bensin', wallet: 'Tunai', memo: '' },
  { id: 4, name: 'Netflix', type: 'expense', amount: 159000, category: 'Hiburan', subcategory: 'Streaming', wallet: 'BCA', memo: 'Monthly' },
  { id: 5, name: 'Listrik', type: 'expense', amount: 350000, category: 'Tagihan', subcategory: 'Listrik', wallet: 'BCA', memo: 'PLN' },
  { id: 6, name: 'Belanja Bulanan', type: 'expense', amount: 500000, category: 'Belanja', subcategory: 'Sembako', wallet: 'BCA', memo: '' },
]

export const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Pendidikan', 'Lain-lain']
export const allCategories = ['Gaji', 'Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Pendidikan', 'Investasi', 'Lain-lain']
export const walletNames = ['BCA', 'Mandiri', 'Tunai']
export const subcategoryList = ['Gaji Pokok', 'Bonus', 'Makan Siang', 'Makan Malam', 'Sembako', 'Bensin', 'Parkir', 'Streaming', 'Pulsa', 'Listrik', 'Servis']

export const categoryColors = {
  'Makanan': '#dc2626', 'Transportasi': '#ea580c', 'Belanja': '#db2777',
  'Hiburan': '#2563eb', 'Kesehatan': '#be123c', 'Tagihan': '#4f46e5',
  'Pendidikan': '#0d9488', 'Lain-lain': '#78716c', 'Gaji': '#059669',
  'Investasi': '#7c3aed', 'Freelance': '#0891b4',
}
