require('dotenv').config()
const connectdb = require("./src/db/db.js")
const app = require('./src/app')

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
connectdb()
