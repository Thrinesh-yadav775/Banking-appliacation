import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

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
