// Pure helpers untuk ekspor laporan ke CSV (semicolon + BOM agar rapi di Excel Indonesia).
// buildReportCSV murni (mudah di-unit-test); downloadCSV menangani Blob + unduhan browser.

export function buildReportCSV(tab, data) {
  const { buckets = [], incomeBreakdown = [], categoryData = [], netWorth = [] } = data
  const lines = []

  if (tab === 'income') {
    lines.push('Kategori;Jumlah')
    incomeBreakdown.forEach(c => lines.push(`${csvCell(c.name)};${c.value}`))
  } else if (tab === 'expense') {
    lines.push('Kategori;Jumlah')
    categoryData.forEach(c => lines.push(`${csvCell(c.name)};${c.value}`))
  } else if (tab === 'networth') {
    lines.push('Periode;Kekayaan Bersih')
    netWorth.forEach(b => lines.push(`${csvCell(b.label)};${b.worth}`))
  } else {
    lines.push('Periode;Pemasukan;Pengeluaran;Transfer;Selisih')
    let tI = 0, tE = 0, tT = 0
    buckets.forEach(b => {
      tI += b.income
      tE += b.expense
      tT += b.transfer
      lines.push(`${csvCell(b.label)};${b.income};${b.expense};${b.transfer};${b.income - b.expense}`)
    })
    lines.push(`TOTAL;${tI};${tE};${tT};${tI - tE}`)
  }

  return lines.join('\n')
}

function csvCell(v) {
  const s = String(v ?? '')
  return s.includes(';') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function downloadCSV(filename, csv) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
