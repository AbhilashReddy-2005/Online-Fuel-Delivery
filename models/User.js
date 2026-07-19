const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: String,
  email: String,
  phone: String,
  password: String,

  otp: String,
  otpExpire: Date

});

module.exports = mongoose.model("User", userSchema);