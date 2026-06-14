const mongoose = require("mongoose");
const transcationschema = new mongoose.Schema({
  fromaccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "transaction must be associated with a from account"],
    index: true,
  },
  toaccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "transaction must be associated with a to account"],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "status can be either PENDING ,COMPLETED,FAILED OR REVERSED",
    },
    default: "PENDING",
  },
  amount:{
    type:Number,
    required:[true,"Amount is required for creating a transaction"],
    min:[0,"transaction amount cannot be negative"]
  },
  idempotencykey:{
    type:String,
    required:[true,"idempotency key is required for creating a transaction"],
    index:true,
    unique:true
  }
},{timestamps:true});
const transactionmodel = mongoose.model("transcations", transcationschema);
module.exports = transactionmodel;
