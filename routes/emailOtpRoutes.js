const express = require("express");

const router = express.Router();

const {
sendEmailOTP,
verifyEmailOTP
} = require("../controllers/emailOtpController");

router.post("/send-email-otp", sendEmailOTP);

router.post("/verify-email-otp", verifyEmailOTP);

module.exports = router;