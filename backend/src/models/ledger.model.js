const mongoose=require('mongoose')
const ledgerschema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"ledger must be associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating a ledger"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transcations",
        required:[true,"ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can be either CREDIT or DEBIT"
        },
        required:[true,"ledger type is required"],
        immutable:true
    }

})

function preventledgermodification(){
    throw new Error("ledger entries are immutable and cannot be modified or deleted")
}

ledgerschema.pre("findOneAndUpdate",preventledgermodification)
ledgerschema.pre("updateOne",preventledgermodification)
ledgerschema.pre("updateMany",preventledgermodification)
ledgerschema.pre("replaceOne",preventledgermodification)
ledgerschema.pre("findOneAndReplace",preventledgermodification)
ledgerschema.pre("findOneAndDelete",preventledgermodification)
ledgerschema.pre("deleteOne",preventledgermodification)
ledgerschema.pre("deleteMany",preventledgermodification)



const ledgermodel=mongoose.model("ledgers",ledgerschema)
module.exports=ledgermodel