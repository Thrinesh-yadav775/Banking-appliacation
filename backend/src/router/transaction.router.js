const express=require('express')
const router=express.Router()
const transactioncontroller=require('../controller/transaction.controller')
const authmiddleware=require('../middleware/auth.middleware')
router.post('/transaction',authmiddleware.authmiddleware,transactioncontroller.createtransaction)
router.post('/system/initial-fund',authmiddleware.authsystemusermiddelware,transactioncontroller.createintialfundtransfer)
router.get('/history',authmiddleware.authmiddleware,transactioncontroller.gettransactions)
module.exports=router