import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, copyFileSync, mkdirSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultPath = path.join(__dirname, '..', 'finance.db')
const dbPath = process.env.DATABASE_PATH || defaultPath

if (process.env.DATABASE_PATH && !existsSync(dbPath)) {
  const dir = path.dirname(dbPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (existsSync(defaultPath)) {
    copyFileSync(defaultPath, dbPath)
  }
}

const db = new DatabaseSync(dbPath)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

export default db
