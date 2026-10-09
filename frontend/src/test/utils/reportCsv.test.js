import { describe, it, expect } from 'vitest'
import { buildReportCSV } from '../../utils/reportCsv'

const buckets = [
  { label: 'Jan', income: 5000000, expense: 2000000, transfer: 100000 },
  { label: 'Feb', income: 5000000, expense: 3000000, transfer: 0 },
]

describe('buildReportCSV', () => {
  it('tab overview berisi kolom transfer dan baris total', () => {
    const csv = buildReportCSV('overview', { buckets })
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Periode;Pemasukan;Pengeluaran;Transfer;Selisih')
    expect(lines[1]).toBe('Jan;5000000;2000000;100000;3000000')
    expect(lines[lines.length - 1]).toBe('TOTAL;10000000;5000000;100000;5000000')
  })

  it('tab income berisi breakdown kategori', () => {
    const csv = buildReportCSV('income', {
      incomeBreakdown: [{ name: 'Gaji', value: 5000000 }],
    })
    expect(csv).toBe('Kategori;Jumlah\nGaji;5000000')
  })

  it('tab expense berisi breakdown kategori', () => {
    const csv = buildReportCSV('expense', {
      categoryData: [{ name: 'Makanan', value: 25000 }],
    })
    expect(csv).toBe('Kategori;Jumlah\nMakanan;25000')
  })

  it('tab networth berisi tren kekayaan', () => {
    const csv = buildReportCSV('networth', {
      netWorth: [{ label: 'Jan', worth: 3000000 }],
    })
    expect(csv).toBe('Periode;Kekayaan Bersih\nJan;3000000')
  })

  it('meng-escape sel mengandung semicolon', () => {
    const csv = buildReportCSV('income', {
      incomeBreakdown: [{ name: 'Gaji;Bonus', value: 100 }],
    })
    expect(csv).toBe('Kategori;Jumlah\n"Gaji;Bonus";100')
  })
})
