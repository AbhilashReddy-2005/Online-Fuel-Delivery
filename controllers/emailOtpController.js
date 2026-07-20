const nodemailer = require("nodemailer");

let otpStore = {};

// ================= SEND EMAIL OTP =================
exports.sendEmailOTP = async (req, res) => {

try {

const { email } = req.body;

if (!email) {
return res.status(400).json({ message: "Email required" });
}

// Generate OTP
const otp = Math.floor(100000 + Math.random() * 900000);

// Save OTP with expiry (5 minutes)
otpStore[email] = {
otp: otp,
expire: Date.now() + 5 * 60 * 1000
};

console.log("Generated OTP:", otp);

// ================= MAIL TRANSPORTER =================
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
});

// ================= EMAIL DATA =================
const mailOptions = {

from: `"Fuel Delivery" <${process.env.EMAIL_USER}>`,
to: email,
subject: "Fuel Delivery OTP Verification",

html: `
<div style="padding:20px; font-family:'Times New Roman', Times, serif;">

<h2 style="color:#333; font-family:'Times New Roman', Times, serif;">
Fuel Delivery OTP Verification
</h2>

<p style="font-family:'Times New Roman', Times, serif;">
Your OTP for registration is:
</p>

<h1 style="color:#2f63d6; letter-spacing:3px; font-family:'Times New Roman', Times, serif;">
${otp}
</h1>

<p style="font-family:'Times New Roman', Times, serif;">
This OTP is valid for <b>5 minutes</b>.
</p>

<br>

<hr>

<p style="font-size:13px; color:gray; text-align:center; font-family:'Times New Roman', Times, serif;">
© 2026 Online Fuel Delivery | Powered By <b>ALR Team</b>
</p>

</div>
`

};

// ================= SEND EMAIL (BACKGROUND) =================
transporter.sendMail(mailOptions)
.then(() => {
console.log("OTP email sent successfully");
})
.catch((error) => {
console.error("Email Error:", error);
});

// Send response immediately
res.json({
success: true,
message: "OTP sent to email successfully"
});

} catch (error) {

console.error("Email Error:", error);

res.status(500).json({
success: false,
message: "Email sending failed"
});

}

};


// ================= VERIFY OTP =================
exports.verifyEmailOTP = (req, res) => {

const { email, otp } = req.body;

if (!email || !otp) {
return res.status(400).json({
message: "Email and OTP required"
});
}

const record = otpStore[email];

if (!record) {
return res.status(400).json({
message: "OTP not found. Please request again."
});
}

// Check expiry
if (record.expire < Date.now()) {

delete otpStore[email];

return res.status(400).json({
message: "OTP expired"
});
}

// Check OTP
if (record.otp == otp) {

delete otpStore[email];

return res.json({
success: true,
message: "OTP verified successfully"
});

} else {

return res.status(400).json({
success: false,
message: "Invalid OTP"
});

}

};
