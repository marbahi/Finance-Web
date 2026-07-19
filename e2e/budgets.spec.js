import { test, expect } from '@playwright/test'

test.describe('Anggaran', () => {
  test('menampilkan halaman anggaran setelah data termuat', async ({ page }) => {
    await page.goto('/budgets')
    await expect(page.getByRole('heading', { name: 'Anggaran' })).toBeVisible()
  })

  test('menampilkan tombol tambah anggaran', async ({ page }) => {
    await page.goto('/budgets')
    await expect(page.getByRole('button', { name: /Tambah Anggaran/i }).first()).toBeVisible()
  })
})
