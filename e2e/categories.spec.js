import { test, expect } from '@playwright/test'

test.describe('Kategori', () => {
  test('menampilkan halaman kategori setelah data termuat', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: 'Kategori' })).toBeVisible()
  })

  test('menampilkan kategori expense yang ada di database', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByText('Makanan')).toBeVisible()
    await expect(page.getByText('Transportasi')).toBeVisible()
    await expect(page.getByText('Belanja')).toBeVisible()
  })

  test('menampilkan kategori income yang ada di database', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByText('Gaji')).toBeVisible()
    await expect(page.getByText('Hadiah')).toBeVisible()
    await expect(page.getByText('Investasi')).toBeVisible()
  })

  test('menampilkan tombol tambah kategori', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('button', { name: /Tambah Kategori/i }).first()).toBeVisible()
  })
})
