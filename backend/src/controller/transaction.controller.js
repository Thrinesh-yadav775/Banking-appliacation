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
  });
  const touseraccount = await accountmodel.findOne({
    _id: toaccount,
  });
  if (!fromuseraccount || !touseraccount) {
    return res.status(400).json({
      message: "account not found",
    });
  }
  const istransactionalreadyexist = await transactionmodel.findOne({
    idempotencykey: idempotencyKey,
  });
  if (istransactionalreadyexist) {
    if (istransactionalreadyexist.status === "COMPLETED") {
      return res.status(200).json({ message: "transaction already exists", transaction: istransactionalreadyexist });
    }
    if (istransactionalreadyexist.status === "PENDING") {
      return res.status(200).json({
        message: "transaction is still processing",
      });
    }
    if (istransactionalreadyexist.status === "FAILED") {
      return res.status(200).json({
        message: "transaction is failed",
      });
    }
    if (istransactionalreadyexist.status === "REVERSED") {
      return res.status(500).json({
        message: "transaction was reversed please retry",
      });
    }
  }
  if (fromuseraccount.status !== "ACTIVE" || touseraccount.status !== "ACTIVE") {
    return res.status(400).json({ message: "account is not active" });
  }

  const balance = await fromuseraccount.getbalance();
  if (balance < amount) {
    return res.status(400).json({
      message: "insufficient funds",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  const [transaction] = await transactionmodel.create(
    [{
      fromaccount: fromuseraccount._id,
      toaccount: touseraccount._id,
      amount,
      idempotencykey: idempotencyKey,
      status: "PENDING",
    }],
    { session },
  );
  await ledgermodel.create(
    [{
      account: fromuseraccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    }],
    { session },
  );

  await ledgermodel.create(
    [{
      account: touseraccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    }],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();

  await emailservice.sendtransactionemail(
    req.user.email,
    req.user.name,
    amount,
    toaccount,
  );
  res.status(201).json({
    message: "transaction completed successfully",
    transaction: transaction,
  });
}
async function createintialfundtransfer(req, res) {
  const { toaccount, amount, idempotencyKey } = req.body;
  if (!toaccount || !amount || !idempotencyKey) {
    return res
      .status(400)
      .json({ message: "toaccount,amount,idempotencyKey are required" });
  }
  const touseraccount = await accountmodel.findOne({
    user: toaccount,
  });
  if (!touseraccount) {
    return res.status(400).json({
      message: "No Account Found",
    });
  }
  const fromuseraccount = await accountmodel.findOne({
    user: req.user._id,
  });
  if (!fromuseraccount) {
    return res.status(400).json({
      message: "system user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  const [transaction] = await transactionmodel.create(
    [{
      fromaccount: fromuseraccount._id,
      toaccount: touseraccount._id,
      amount,
      idempotencykey: idempotencyKey,
      status: "PENDING",
    }],
    { session },
  );
  await ledgermodel.create(
    [{
      account: fromuseraccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    }],
    { session },
  );

  await ledgermodel.create(
    [{
      account: touseraccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    }],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    message: "initial fund transaction completed successfully",
    transaction: transaction,
  });
}
async function gettransactions(req, res) {
  try {
    const useraccounts = await accountmodel.find({ user: req.user._id }).select("_id");
    const accountids = useraccounts.map((a) => a._id);

    const transactions = await transactionmodel
      .find({
        $or: [{ fromaccount: { $in: accountids } }, { toaccount: { $in: accountids } }],
      })
      .populate({ path: "fromaccount", populate: { path: "user", select: "name" } })
      .populate({ path: "toaccount", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 })
      .limit(50);

    const accountidstrings = accountids.map((id) => id.toString());
    const tagged = [];
    for (const t of transactions) {
      const issent = accountidstrings.includes(t.fromaccount._id.toString());
      const isreceived = accountidstrings.includes(t.toaccount._id.toString());
      if (issent) {
        tagged.push({ _id: t._id, fromname: t.fromaccount.user?.name, toname: t.toaccount.user?.name, amount: t.amount, status: t.status, type: "SENT", createdAt: t.createdAt });
      }
      if (isreceived) {
        tagged.push({ _id: t._id, fromname: t.fromaccount.user?.name, toname: t.toaccount.user?.name, amount: t.amount, status: t.status, type: "RECEIVED", createdAt: t.createdAt });
      }
    }

    return res.status(200).json({ transactions: tagged });
  } catch (err) {
    return res.status(500).json({ message: "failed to fetch transactions" });
  }
}

module.exports = { createtransaction, createintialfundtransfer, gettransactions };
