const User = require("../models/User");

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, otp: 0, otpExpire: 0 }).sort({ _id: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0, otp: 0, otpExpire: 0 });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE user (name, phone, email)
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true, runValidators: true, select: "-password -otp -otpExpire" }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
