const mongoose = require("mongoose");
const ledgermodel=require("./ledger.model")
const accountschema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "account must be associated with a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "status can be either ACTIVE,FROZEN,CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);
accountschema.index({ user: 1, status: 1 });
accountschema.methods.getbalance = async function () {
    const balancedata = await ledgermodel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totaldebit: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$type", "DEBIT"] },
                            then: "$amount",
                            else: 0,
                        },
                    },
                },
                totalcredit: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$type", "CREDIT"] },
                            then: "$amount",
                            else: 0,
                        },
                    },
                },
            },
        },{
            $project:{
                _id:0,
                balance:{$subtract:["$totalcredit","$totaldebit"]}
            }
        }
    ]);
    if (balancedata.length === 0) {
        return 0;
    }
    return balancedata[0].balance;
};
const accountmodel = mongoose.model("account", accountschema);
module.exports = accountmodel;
