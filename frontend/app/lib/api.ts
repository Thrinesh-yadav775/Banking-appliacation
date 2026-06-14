import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const registerUser = (name: string, email: string, password: string) =>
  api.post('/api/auth/register', { name, email, password })

export const loginUser = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password })

export const logoutUser = () =>
  api.post('/api/auth/logout')

export const createAccount = () =>
  api.post('/api/create/account')

export const getAllAccounts = () =>
  api.get('/api/create/getallaccounts')

export const getBalance = (accountid: string) =>
  api.get(`/api/create/getbalance/${accountid}`)

export const getTransactions = () =>
  api.get('/api/send/history')

export const sendTransaction = (
  fromaccount: string,
  toaccount: string,
  amount: number,
  idempotencyKey: string
) => api.post('/api/send/transaction', { fromaccount, toaccount, amount, idempotencyKey })
