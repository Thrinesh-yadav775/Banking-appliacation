const accountmodel = require('../models/account.model')

async function createaccount(req, res) {
  try {
    const account = await accountmodel.create({ user: req.user._id })
    return res.status(200).json({ message: "account created successfully", account })
  } catch (err) {
    return res.status(500).json({ message: "failed to create account" })
  }
}

async function getallaccounts(req, res) {
  try {
    const accounts = await accountmodel.find({ user: req.user._id }).populate("user", "name email")
    res.status(200).json({ message: "accounts data fetched successfully", accounts })
  } catch (err) {
    return res.status(500).json({ message: "failed to fetch accounts" })
  }
}

async function getbalance(req, res) {
  try {
    const { accountid } = req.params
    const account = await accountmodel.findOne({ _id: accountid, user: req.user._id })
    if (!account) {
      return res.status(404).json({ message: "Account not found" })
    }
    const balance = await account.getbalance()
    res.status(200).json({ accountid: account._id, balance })
  } catch (err) {
    return res.status(500).json({ message: "failed to fetch balance" })
  }
}

module.exports = { createaccount, getallaccounts, getbalance }
