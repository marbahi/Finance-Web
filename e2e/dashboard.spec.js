import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('menampilkan ringkasan keuangan setelah data termuat', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Saldo Total')).toBeVisible()
    await expect(page.getByText('Pemasukan', { exact: true })).toBeVisible()
    await expect(page.getByText('Pengeluaran', { exact: true })).toBeVisible()
    await expect(page.getByText('Selisih')).toBeVisible()
  })

  test('menampilkan grafik pemasukan vs pengeluaran', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Pemasukan vs Pengeluaran (6 bulan)')).toBeVisible()
  })
})
