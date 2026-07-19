import { copyFileSync, unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const testDbPath = join(__dirname, '..', '..', 'finance.test.db')
const originalDbPath = join(__dirname, '..', '..', 'finance.db')

export function getTestDbPath() {
  return testDbPath
}

export function setupTestDb() {
  if (existsSync(originalDbPath)) {
    copyFileSync(originalDbPath, testDbPath)
  }
  process.env.DATABASE_PATH = testDbPath
}

export function teardownTestDb() {
  delete process.env.DATABASE_PATH
  try { unlinkSync(testDbPath) } catch {}
}

export const CATEGORY_TYPES = { 1: 'income', 2: 'expense' }
export const TRANS_TYPES = { 0: 'income', 1: 'expense', 2: 'transfer' }
export const DEBT_TYPES = { 0: 'debt', 1: 'receivable' }
export const GOAL_ICONS = ['PiggyBank', 'House', 'Airplane', 'Car', 'GraduationCap', 'Heart', 'Lightbulb', 'Star']
export const RECUR_TYPES = { 0: 'expense', 1: 'income', 2: 'transfer' }
export const FREQ_TYPES = { 1: 'daily', 2: 'weekly', 3: 'monthly', 4: 'yearly' }
export const TEMPLATE_TYPES = { 0: 'expense', 1: 'income' }
