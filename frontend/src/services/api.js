const BASE = '/api'

async function request(url, options = {}) {
  const token = localStorage.getItem('finance_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${url}`, {
    headers,
    ...options,
  })

  if (res.status === 401) {
    localStorage.removeItem('finance_token')
    localStorage.removeItem('finance_user')
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const walletsApi = {
  list: () => request('/wallets'),
  get: (id) => request(`/wallets/${id}`),
  create: (data) => request('/wallets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/wallets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/wallets/${id}`, { method: 'DELETE' }),
}

export const categoriesApi = {
  list: () => request('/categories'),
  getAll: () => request('/categories/all'),
  get: (id) => request(`/categories/${id}`),
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
}

export const transactionsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.type) qs.set('type', params.type)
    if (params.wallet_id) qs.set('wallet_id', params.wallet_id)
    if (params.category_id) qs.set('category_id', params.category_id)
    if (params.month) qs.set('month', params.month)
    if (params.year) qs.set('year', params.year)
    const query = qs.toString()
    return request(`/transactions${query ? '?' + query : ''}`)
  },
  get: (id) => request(`/transactions/${id}`),
  create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
}

export const budgetsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.month) qs.set('month', params.month)
    if (params.year) qs.set('year', params.year)
    const query = qs.toString()
    return request(`/budgets${query ? '?' + query : ''}`)
  },
  get: (id) => request(`/budgets/${id}`),
  create: (data) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
}

export const debtsApi = {
  list: () => request('/debts'),
  get: (id) => request(`/debts/${id}`),
  create: (data) => request('/debts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/debts/${id}`, { method: 'DELETE' }),
  pay: (id, data) => request(`/debts/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),
  payments: (id) => request(`/debts/${id}/payments`),
}

export const goalsApi = {
  list: () => request('/goals'),
  get: (id) => request(`/goals/${id}`),
  create: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
  fund: (id, data) => request(`/goals/${id}/fund`, { method: 'POST', body: JSON.stringify(data) }),
}

export const recurringApi = {
  list: () => request('/recurring'),
  get: (id) => request(`/recurring/${id}`),
  create: (data) => request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/recurring/${id}`, { method: 'DELETE' }),
  toggle: (id) => request(`/recurring/${id}/toggle`, { method: 'PATCH' }),
}

export const templatesApi = {
  list: () => request('/templates'),
  get: (id) => request(`/templates/${id}`),
  create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
}
