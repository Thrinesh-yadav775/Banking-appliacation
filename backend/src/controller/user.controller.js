const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailservice = require('../services/email.service')
const { blacklistToken } = require("../models/blacklistedtoken.model");

async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "email, password and name are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }
    const isuseralreadyexists = await usermodel.findOne({ email });
    if (isuseralreadyexists) {
      return res.status(422).json({ message: "user already exists", status: "failed" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await usermodel.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ id: user._id }, process.env.tokenkey, { expiresIn: "3d" });
    const { password: _pw, ...safeUser } = user.toObject();
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
    res.status(201).json({ message: "user registered successfully", user: safeUser, token });
    emailservice.sendregistration(user.email, user.name).catch((e) => console.error('Registration email failed:', e.message));
  } catch (err) {
    return res.status(500).json({ message: "registration failed, please try again" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }
    const isvaliduser = await usermodel.findOne({ email }).select("+password");
    if (!isvaliduser) {
      return res.status(400).json({ message: "invalid login credentials" });
    }
    const ispasswordvalid = await bcrypt.compare(password, isvaliduser.password);
    if (!ispasswordvalid) {
      return res.status(400).json({ message: "invalid password" });
    }
    const token = jwt.sign({ id: isvaliduser._id }, process.env.tokenkey, { expiresIn: "3d" });
    const { password: _pw, ...safeUser } = isvaliduser.toObject();
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
    res.status(200).json({ message: "Login successful", user: safeUser, token });
    emailservice.sendlogin(isvaliduser.email, isvaliduser.name).catch((e) => console.error('Login email failed:', e.message));
  } catch (err) {
    return res.status(500).json({ message: "login failed, please try again" });
  }
}

async function logout(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await blacklistToken(token);
    res.clearCookie("token");
  }
  res.status(200).json({ message: "logged out successfully" });
}

module.exports = { register, login, logout };
