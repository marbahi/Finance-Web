import { test, expect } from '@playwright/test'

test.describe('Dompet', () => {
  test('menampilkan halaman dompet setelah data termuat', async ({ page }) => {
    await page.goto('/wallets')
    await expect(page.getByRole('heading', { name: 'Dompet' })).toBeVisible()
  })

  test('menampilkan ringkasan total saldo', async ({ page }) => {
    await page.goto('/wallets')
    await expect(page.getByText('Total Saldo')).toBeVisible()
    await expect(page.getByText('Total Aset')).toBeVisible()
  })

  test('menampilkan nama-nama dompet yang ada di database', async ({ page }) => {
    await page.goto('/wallets')
    await expect(page.getByText('Jago').first()).toBeVisible()
    await expect(page.getByText('Uang tunai')).toBeVisible()
    await expect(page.getByText('Jago Lain')).toBeVisible()
    await expect(page.getByText('Uang lain')).toBeVisible()
  })

  test('menampilkan tombol tambah dompet', async ({ page }) => {
    await page.goto('/wallets')
    await expect(page.getByRole('button', { name: /Tambah Dompet/i }).first()).toBeVisible()
  })
})
