const accountmodel=require('../models/account.model')

async function createaccount(req,res){
    const user =req.user
    const account=await accountmodel.create({
        user:user._id
    })
    return res.status(200).json({message:"account created successfully",account})
}
async function getallaccounts(req,res){
    const accounts=await accountmodel.find({
        user:req.user._id
    }).populate("user","name email")
    res.status(200).json({
        message:"accounts data fetched successfully",accounts:accounts
    })
}
async function getbalance(req,res){
const {accountid}=req.params
const account=await accountmodel.findOne({
    _id:accountid,
    user:req.user._id
})
if(!account){
    return res.status(404).json({
        message:"Account not found"
    })
}
const balance=await account.getbalance()

res.status(200).json({
    accountid:account._id,
    balance:balance
})
}
module.exports={createaccount,getallaccounts,getbalance}