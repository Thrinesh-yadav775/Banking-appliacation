const mongoose=require('mongoose')
async function connectdb(){
    try{
         await mongoose.connect(process.env.databaseurl)
    console.log("database connected successfully")
    }
    catch(err){
        console.error("Database connection error:", err.message)
        process.exit(1)
    }
   
}
module.exports=connectdb