const mongoose = require("mongoose");
const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required for register process"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
      unique: [true, "email already exists"],
    },
    name: {
      type: String,
      required: [true, "name is required for createing account"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
    systemuser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);
const usermodel = mongoose.model("user", userschema);
module.exports = usermodel;
