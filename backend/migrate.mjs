import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'fs'
import pkg from 'pg'
const { Client } = pkg

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tjdnccrinsnaosxfqcyw.supabase.co'
const PROJECT_REF = 'tjdnccrinsnaosxfqcyw'

async function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const pgUser = process.env.PGUSER || 'postgres'
  const pgHost = process.env.PGHOST || `aws-0-ap-southeast-1.pooler.supabase.com`
  const pgPort = process.env.PGPORT || '6543'
  const pgDb = process.env.PGDATABASE || 'postgres'
  const pgPass = process.env.PGPASSWORD

  if (pgPass) {
    return `postgresql://${pgUser}.${PROJECT_REF}:${pgPass}@${pgHost}:${pgPort}/${pgDb}`
  }

  return null
}

async function main() {
  const dbUrl = await getDbUrl()

  if (!dbUrl) {
    console.log('╔══════════════════════════════════════════════════════╗')
    console.log('║  DATABASE_URL atau PGPASSWORD tidak ditemukan        ║')
    console.log('║                                                    ║')
    console.log('║  Jalankan SQL migration manual ke Supabase SQL      ║')
    console.log('║  Editor. SQL file: migrations/001_initial.sql      ║')
    console.log('║                                                    ║')
    console.log('║  Atau set environment variable:                     ║')
    console.log('║  PGPASSWORD=<password dari Supabase Dashboard>      ║')
    console.log('║  Dashboard > Settings > Database > Database         ║')
    console.log('║  Password                                          ║')
    console.log('╚══════════════════════════════════════════════════════╝')
    process.exit(1)
  }

  console.log('Connecting to Supabase PostgreSQL...')
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected.')

  console.log('Cleaning existing data...')
  const dropTables = [
    'currency', 'template', 'recurring', 'goaltrans', 'goal',
    'debttrans', 'debt', 'user_budget', 'budgetcategory', 'budget',
    'media', 'trans', 'subcategory', 'category', 'wallet', 'account'
  ]
  for (const t of dropTables) {
    await client.query(`DROP TABLE IF EXISTS "${t}" CASCADE`)
  }
  console.log('Tables dropped.')

  console.log('Running migration SQL...')
  const sql = readFileSync('./migrations/001_initial.sql', 'utf-8')
  await client.query(sql)
  console.log('Tables created.')

  console.log('Migrating data from SQLite...')
  const sqlite = new DatabaseSync('./finance.db')

  const tables = [
    'account', 'wallet', 'category', 'subcategory', 'trans',
    'media', 'budget', 'budgetCategory', 'user_budget',
    'debt', 'debtTrans', 'goal', 'goalTrans', 'recurring',
    'template', 'currency'
  ]

  for (const table of tables) {
    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all()
    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows (skipped)`)
      continue
    }

    const columns = Object.keys(rows[0])
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    const colList = columns.map(c => `"${c}"`).join(', ')

    for (const row of rows) {
      const values = columns.map(c => {
        const v = row[c]
        if (v === null || v === undefined) return null
        return v
      })
      try {
        await client.query(
          `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
          values
        )
      } catch (err) {
        console.error(`  ${table}: error inserting id=${row.id}: ${err.message}`)
      }
    }
    console.log(`  ${table}: ${rows.length} rows migrated`)
  }

  await client.end()
  sqlite.close()
  console.log('Migration complete!')
}

main().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
