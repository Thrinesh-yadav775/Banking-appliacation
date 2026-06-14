const express = require('express')
const router = express.Router()
const authcontroller = require('../controller/user.controller')
const { authmiddleware } = require('../middleware/auth.middleware')

router.post("/register", authcontroller.register)
router.post("/login", authcontroller.login)
router.post("/logout", authmiddleware, authcontroller.logout)

module.exports = router
