// ================= PACKAGES =================
const User = require("../models/User");
const axios = require("axios");


// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {

  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP SMS
    await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        route: "otp",
        variables_values: otp,
        flash: 0,
        numbers: phone
      }
    });

    // Save OTP in DB
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
    }

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "OTP sending failed"
    });

  }

};


// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {

  try {

    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "OTP verification failed"
    });

  }

};
