import { test, expect } from '@playwright/test'

test.describe('Transaksi', () => {
  test('menampilkan halaman transaksi setelah data termuat', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page.getByRole('heading', { name: 'Transaksi' })).toBeVisible()
    await expect(page.getByText('total transaksi')).toBeVisible()
  })

  test('menampilkan tabel transaksi setelah data termuat', async ({ page }) => {
    await page.goto('/transactions')
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('filter dropdown tersedia untuk tipe', async ({ page }) => {
    await page.goto('/transactions')
    const filterSelect = page.locator('select').first()
    await expect(filterSelect).toBeVisible()
    await expect(filterSelect).toContainText('Pengeluaran')
    await expect(filterSelect).toContainText('Pemasukan')
  })

  test('filter berdasarkan tipe pengeluaran', async ({ page }) => {
    await page.goto('/transactions')
    const filterSelect = page.locator('select').first()
    await filterSelect.selectOption('expense')

    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('menampilkan tombol tambah transaksi', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page.getByRole('button', { name: /Tambah Transaksi/i }).first()).toBeVisible()
  })
})
