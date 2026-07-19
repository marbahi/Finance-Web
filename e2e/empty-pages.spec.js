import { test, expect } from '@playwright/test'

test.describe('Halaman Tanpa Data', () => {
  test('halaman Target menampilkan pesan kosong', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.getByText('Target')).toBeVisible()
    await expect(page.getByText('Belum ada target keuangan')).toBeVisible()
  })

  test('halaman Hutang / Piutang dapat diakses', async ({ page }) => {
    await page.goto('/debts')
    await expect(page.getByRole('heading', { name: /Hutang/ })).toBeVisible()
  })

  test('halaman Berulang dapat diakses', async ({ page }) => {
    await page.goto('/recurring')
    await expect(page.getByRole('heading', { name: 'Transaksi Berulang' })).toBeVisible()
  })

  test('halaman Template dapat diakses', async ({ page }) => {
    await page.goto('/templates')
    await expect(page.getByRole('heading', { name: 'Template Transaksi' })).toBeVisible()
  })
})
