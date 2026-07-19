import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DummyProvider, useDummy } from '../../data/DummyContext'

const mockList = vi.hoisted(() => ({
  transactions: vi.fn(),
  wallets: vi.fn(),
  categories: vi.fn(),
  budgets: vi.fn(),
  debts: vi.fn(),
  goals: vi.fn(),
  recurring: vi.fn(),
  templates: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  transactionsApi: { list: mockList.transactions, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  walletsApi: { list: mockList.wallets, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoriesApi: { list: mockList.categories, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), getAll: vi.fn() },
  budgetsApi: { list: mockList.budgets, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  debtsApi: { list: mockList.debts, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), pay: vi.fn(), payments: vi.fn() },
  goalsApi: { list: mockList.goals, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), fund: vi.fn() },
  recurringApi: { list: mockList.recurring, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), toggle: vi.fn() },
  templatesApi: { list: mockList.templates, get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))

const mockData = {
  transactions: [{ id: 1, note: 'Bakso', amount: 25000, type: 'expense', date: '2026-07-15', category: 'Makanan', wallet: 'Tunai' }],
  wallets: [{ id: 1, name: 'Tunai', type: 'cash', balance: 500000 }],
  categories: [{ id: 1, name: 'Makanan', type: 'expense', color: '#dc2626' }],
  budgets: [{ id: 1, category: 'Makanan', amount: 1000000, spent: 500000 }],
  debts: [{ id: 1, name: 'Pinjaman', amount: 5000000 }],
  goals: [{ id: 1, name: 'Liburan', target: 20000000, current: 5000000 }],
  recurring: [{ id: 1, note: 'Bayar Sewa', amount: 2000000, frequency: 'monthly' }],
  templates: [{ id: 1, name: 'Template 1', note: 'test', amount: 100000 }],
}

function TestConsumer() {
  const ctx = useDummy()
  return (
    <div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="error">{ctx.error || ''}</div>
      <div data-testid="tx-count">{ctx.transactions.length}</div>
      <div data-testid="wallet-count">{ctx.wallets.length}</div>
      <div data-testid="cat-count">{ctx.categories.length}</div>
      <div data-testid="budget-count">{ctx.budgets.length}</div>
      <div data-testid="debt-count">{ctx.debts.length}</div>
      <div data-testid="goal-count">{ctx.goals.length}</div>
      <div data-testid="recurring-count">{ctx.recurring.length}</div>
      <div data-testid="template-count">{ctx.templates.length}</div>
    </div>
  )
}

describe('DummyContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memuat data dari API saat mount', async () => {
    mockList.transactions.mockResolvedValue(mockData.transactions)
    mockList.wallets.mockResolvedValue(mockData.wallets)
    mockList.categories.mockResolvedValue(mockData.categories)
    mockList.budgets.mockResolvedValue(mockData.budgets)
    mockList.debts.mockResolvedValue(mockData.debts)
    mockList.goals.mockResolvedValue(mockData.goals)
    mockList.recurring.mockResolvedValue(mockData.recurring)
    mockList.templates.mockResolvedValue(mockData.templates)

    render(
      <DummyProvider>
        <TestConsumer />
      </DummyProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('tx-count').textContent).toBe('1')
    expect(screen.getByTestId('wallet-count').textContent).toBe('1')
    expect(screen.getByTestId('cat-count').textContent).toBe('1')
    expect(screen.getByTestId('budget-count').textContent).toBe('1')
    expect(screen.getByTestId('debt-count').textContent).toBe('1')
    expect(screen.getByTestId('goal-count').textContent).toBe('1')
    expect(screen.getByTestId('recurring-count').textContent).toBe('1')
    expect(screen.getByTestId('template-count').textContent).toBe('1')
  })

  it('menampilkan error saat API gagal', async () => {
    mockList.transactions.mockRejectedValue(new Error('Network Error'))

    render(
      <DummyProvider>
        <TestConsumer />
      </DummyProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('error').textContent).toBe('Network Error')
  })

  it('memanggil semua endpoint API list saat mount', async () => {
    mockList.transactions.mockResolvedValue([])
    mockList.wallets.mockResolvedValue([])
    mockList.categories.mockResolvedValue([])
    mockList.budgets.mockResolvedValue([])
    mockList.debts.mockResolvedValue([])
    mockList.goals.mockResolvedValue([])
    mockList.recurring.mockResolvedValue([])
    mockList.templates.mockResolvedValue([])

    render(
      <DummyProvider>
        <TestConsumer />
      </DummyProvider>
    )

    await waitFor(() => {
      expect(mockList.transactions).toHaveBeenCalledTimes(1)
    })
    expect(mockList.wallets).toHaveBeenCalledTimes(1)
    expect(mockList.categories).toHaveBeenCalledTimes(1)
    expect(mockList.budgets).toHaveBeenCalledTimes(1)
    expect(mockList.debts).toHaveBeenCalledTimes(1)
    expect(mockList.goals).toHaveBeenCalledTimes(1)
    expect(mockList.recurring).toHaveBeenCalledTimes(1)
    expect(mockList.templates).toHaveBeenCalledTimes(1)
  })
})
