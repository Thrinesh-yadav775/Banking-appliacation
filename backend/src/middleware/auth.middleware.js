const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../models/blacklistedtoken.model");

async function authmiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "unauthorized user" });
  }
  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "token has been logged out" });
  }
  try {
    const decoded = jwt.verify(token, process.env.tokenkey);
    const user = await usermodel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "unauthorized access" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "unauthorized access" });
  }
}
async function authsystemusermiddelware(req,res,next) {
  const token=req.cookies.token||req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({ message:"unauthorized access,token is missing" })
  }
  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "token has been logged out" });
  }
  try{
    const decoded=jwt.verify(token,process.env.tokenkey)
    const user=await usermodel.findById(decoded.id).select("+systemuser")
    if(!user.systemuser){
      return res.status(403).json({
        message:"forbiden access , not a system user"
      })
    }
    req.user=user
    return next()
  }
  catch(err){
    return res.status(401).json({message:"unauthorized"})
  }
}

module.exports = { authmiddleware,authsystemusermiddelware };
