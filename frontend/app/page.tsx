'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllAccounts, getBalance, createAccount, sendTransaction, getTransactions } from './lib/api'

type Account = {
  _id: string
  status: string
  currency: string
  createdAt: string
}

type AccountWithBalance = Account & { balance: number }

type Transaction = {
  _id: string
  fromname: string
  toname: string
  amount: number
  status: string
  type: 'SENT' | 'RECEIVED'
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string }>({})
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fromAccount, setFromAccount] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [amount, setAmount] = useState('')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    loadAccounts()
  }, [])

  async function loadAccounts() {
    setLoading(true)
    try {
      const [accountRes, txRes] = await Promise.all([getAllAccounts(), getTransactions()])
      const accountList: Account[] = accountRes.data.accounts

      const withBalances = await Promise.all(
        accountList.map(async (acc) => {
          try {
            const balRes = await getBalance(acc._id)
            return { ...acc, balance: balRes.data.balance }
          } catch {
            return { ...acc, balance: 0 }
          }
        })
      )
      setAccounts(withBalances)
      setTransactions(txRes.data.transactions)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load accounts')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAccount() {
    setCreating(true)
    setMessage('')
    setError('')
    try {
      await createAccount()
      setMessage('Account created successfully!')
      loadAccounts()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')
    setSending(true)
    try {
      const idempotencyKey = crypto.randomUUID()
      await sendTransaction(fromAccount, toUserId, Number(amount), idempotencyKey)
      setMessage(`Transferred ₹${amount} successfully!`)
      setFromAccount('')
      setToUserId('')
      setAmount('')
      loadAccounts()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
        <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-3xl font-bold">Welcome back, {user.name || 'User'}</h1>
        <p className="text-indigo-200 text-sm mt-1">{user.email}</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">My Accounts</h2>
          <button
            onClick={handleCreateAccount}
            disabled={creating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : '+ New Account'}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-400 text-sm">No accounts yet. Click &quot;+ New Account&quot; to create one.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="flex items-center justify-between gap-3 rounded-xl p-4 border-l-4 border-indigo-500 bg-indigo-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-indigo-900">Account</p>
                  <p className="font-mono text-xs text-indigo-400 mt-0.5 truncate">{acc._id}</p>
                  <p className="text-xs text-indigo-400 mt-0.5">{acc.currency} · {acc.status}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-indigo-700">₹{acc.balance.toLocaleString()}</p>
                  <p className="text-xs text-indigo-400">Available Balance</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Send Money</h2>

        <form onSubmit={handleTransfer} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">From Account</label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select your account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc._id} — ₹{acc.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient Account ID</label>
            <input
              type="text"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Paste recipient's account ID"
            />
            <p className="text-xs text-gray-400 mt-1">Ask the recipient to share their Account ID from their dashboard.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}
          >
            {sending ? 'Sending...' : 'Send Money →'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Transaction History</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx, i) => (
              <div
                key={`${tx._id}-${i}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-base font-bold ${tx.type === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                    {tx.type === 'RECEIVED' ? '↓' : '↑'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {tx.type === 'RECEIVED' ? 'Received' : 'Sent'}
                    </p>
                    <p className="font-mono text-xs text-gray-400 mt-0.5 truncate">
                      {tx.type === 'SENT' ? `To: ${tx.toname}` : `From: ${tx.fromname}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className={`text-lg font-bold ${tx.type === 'RECEIVED' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {tx.type === 'RECEIVED' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Share Your Account ID</h2>
        <p className="text-xs text-gray-400 mb-3">Share an account ID below so others can send money to you.</p>
        <div className="flex flex-col gap-2">
          {accounts.map((acc) => (
            <div key={acc._id} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-mono text-sm text-indigo-700 break-all select-all">
              {acc._id}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
