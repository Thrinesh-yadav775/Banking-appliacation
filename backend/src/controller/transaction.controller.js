const transactionmodel = require("../models/transaction.model");
const ledgermodel = require("../models/ledger.model");
const accountmodel = require("../models/account.model");
const usermodel = require("../models/user.model");
const emailservice = require("../services/email.service");
const mongoose = require("mongoose");

async function createtransaction(req, res) {
  const { fromaccount, toaccount, amount, idempotencyKey } = req.body;
  if (!fromaccount || !toaccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "missing required fields" });
  }

  const fromuseraccount = await accountmodel.findOne({
    _id: fromaccount,
    user: req.user._id,
  });
  if (!fromuseraccount) {
    return res.status(403).json({ message: "unauthorized: account does not belong to you" });
  }

  const touseraccount = await accountmodel.findOne({ _id: toaccount }).populate("user", "name email");
  if (!touseraccount) {
    return res.status(400).json({ message: "recipient account not found" });
  }

  const istransactionalreadyexist = await transactionmodel.findOne({ idempotencykey: idempotencyKey });
  if (istransactionalreadyexist) {
    if (istransactionalreadyexist.status === "COMPLETED") {
      return res.status(200).json({ message: "transaction already exists", transaction: istransactionalreadyexist });
    }
    if (istransactionalreadyexist.status === "PENDING") {
      return res.status(200).json({ message: "transaction is still processing" });
    }
    if (istransactionalreadyexist.status === "FAILED") {
      return res.status(200).json({ message: "transaction failed" });
    }
    if (istransactionalreadyexist.status === "REVERSED") {
      return res.status(500).json({ message: "transaction was reversed please retry" });
    }
  }

  if (fromuseraccount.status !== "ACTIVE" || touseraccount.status !== "ACTIVE") {
    return res.status(400).json({ message: "account is not active" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const balance = await fromuseraccount.getbalance();
    if (balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "insufficient funds" });
    }

    const [transaction] = await transactionmodel.create(
      [{ fromaccount: fromuseraccount._id, toaccount: touseraccount._id, amount, idempotencykey: idempotencyKey, status: "PENDING" }],
      { session },
    );

    await ledgermodel.create(
      [{ account: fromuseraccount._id, amount, transaction: transaction._id, type: "DEBIT" }],
      { session },
    );

    await ledgermodel.create(
      [{ account: touseraccount._id, amount, transaction: transaction._id, type: "CREDIT" }],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "transaction completed successfully", transaction });

    const recipientName = touseraccount.user?.name || touseraccount._id.toString();
    emailservice.sendtransactionemail(req.user.email, req.user.name, amount, recipientName).catch(() => {});
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "transaction failed, please retry" });
  }
}

async function createintialfundtransfer(req, res) {
  const { toaccount, amount, idempotencyKey } = req.body;
  if (!toaccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "toaccount, amount, idempotencyKey are required" });
  }

  const touseraccount = await accountmodel.findOne({ user: toaccount });
  if (!touseraccount) {
    return res.status(400).json({ message: "No Account Found" });
  }

  const fromuseraccount = await accountmodel.findOne({ user: req.user._id });
  if (!fromuseraccount) {
    return res.status(400).json({ message: "system user account not found" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [transaction] = await transactionmodel.create(
      [{ fromaccount: fromuseraccount._id, toaccount: touseraccount._id, amount, idempotencykey: idempotencyKey, status: "PENDING" }],
      { session },
    );

    await ledgermodel.create(
      [{ account: fromuseraccount._id, amount, transaction: transaction._id, type: "DEBIT" }],
      { session },
    );

    await ledgermodel.create(
      [{ account: touseraccount._id, amount, transaction: transaction._id, type: "CREDIT" }],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "initial fund transaction completed successfully", transaction });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "fund transfer failed, please retry" });
  }
}

async function gettransactions(req, res) {
  try {
    const useraccounts = await accountmodel.find({ user: req.user._id }).select("_id");
    const accountids = useraccounts.map((a) => a._id);

    const transactions = await transactionmodel
      .find({ $or: [{ fromaccount: { $in: accountids } }, { toaccount: { $in: accountids } }] })
      .populate({ path: "fromaccount", populate: { path: "user", select: "name" } })
      .populate({ path: "toaccount", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 })
      .limit(50);

    const accountidstrings = accountids.map((id) => id.toString());
    const tagged = [];
    for (const t of transactions) {
      const issent = accountidstrings.includes(t.fromaccount._id.toString());
      const isreceived = accountidstrings.includes(t.toaccount._id.toString());
      if (issent && isreceived) {
        tagged.push({ _id: t._id, fromname: t.fromaccount.user?.name, toname: t.toaccount.user?.name, amount: t.amount, status: t.status, type: "SENT", createdAt: t.createdAt });
      } else if (issent) {
        tagged.push({ _id: t._id, fromname: t.fromaccount.user?.name, toname: t.toaccount.user?.name, amount: t.amount, status: t.status, type: "SENT", createdAt: t.createdAt });
      } else if (isreceived) {
        tagged.push({ _id: t._id, fromname: t.fromaccount.user?.name, toname: t.toaccount.user?.name, amount: t.amount, status: t.status, type: "RECEIVED", createdAt: t.createdAt });
      }
    }

    return res.status(200).json({ transactions: tagged });
  } catch (err) {
    return res.status(500).json({ message: "failed to fetch transactions" });
  }
}

module.exports = { createtransaction, createintialfundtransfer, gettransactions };
