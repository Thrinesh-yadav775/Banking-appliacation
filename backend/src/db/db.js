const mongoose=require('mongoose')
async function connectdb(){
    try{
         await mongoose.connect(process.env.databaseurl)
    console.log("database connected successfully")
    }
    catch{
        console.log("error is database connection")
    }
   
}
module.exports=connectdb