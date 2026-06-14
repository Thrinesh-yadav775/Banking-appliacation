const express=require('express')
const accountcontroller=require('../controller/account.controller')
const authmiddleware=require('../middleware/auth.middleware')
const router=express.Router()
router.post("/account",authmiddleware.authmiddleware,accountcontroller.createaccount)
router.get("/getallaccounts",authmiddleware.authmiddleware,accountcontroller.getallaccounts)
router.get('/getbalance/:accountid',authmiddleware.authmiddleware,accountcontroller.getbalance)
module.exports=router