const express = require('express')
const cookieparser = require("cookie-parser")
const cors = require("cors")
const authrouter = require('./router/user.router')
const accountrouter = require('./router/account.router')
const transcationrouter = require('./router/transaction.router')

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
}))
app.use(cookieparser())
app.use(express.json())

app.use('/api/auth', authrouter)
app.use('/api/create', accountrouter)
app.use('/api/send', transcationrouter)

module.exports = app
