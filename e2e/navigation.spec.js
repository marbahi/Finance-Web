import { test, expect } from '@playwright/test'

test.describe('Navigasi Aplikasi', () => {
  test('halaman Dashboard menampilkan judul dan menu navigasi', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Finance Monitor' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Transaksi' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dompet' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Kategori' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Anggaran' })).toBeVisible()
  })

  test('navigasi ke halaman Transaksi', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Transaksi' }).click()

    await expect(page).toHaveURL(/\/transactions/)
  })

  test('navigasi ke halaman Dompet', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Dompet' }).click()

    await expect(page).toHaveURL(/\/wallets/)
  })
})
