require('dotenv').config()
const dns=require('dns')
const connectdb=require("./src/db/db.js")
const app =require('./src/app')
dns.setServers(["0.0.0.0","8.8.8.8"])
app.listen(3000,()=>{
    console.log("Server is running or port 3000")
})
connectdb()