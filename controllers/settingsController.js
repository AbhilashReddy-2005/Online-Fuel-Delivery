const Settings = require("../models/Settings");

console.log("✅ SettingsController.js loaded");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        appName: "FuelGo",
        appVersion: "1.0.0",
        currency: "INR",
        timezone: "Asia/Kolkata",
        paymentMethods: ["online", "cash"],
        deliveryCharges: 50,
        minOrderValue: 500,
        maxOrderValue: 50000,
        supportEmail: "support@fuelgo.com",
        supportPhone: "+91-9876543210",
        businessHours: "9:00 AM - 11:00 PM",
        maintenanceMode: false,
        notificationsEnabled: true
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, message: "Settings updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updateDeliveryCharges = async (req, res) => {
  try {
    const { charges } = req.body;
    const settings = await Settings.findOneAndUpdate({}, { deliveryCharges: Number(charges) }, { new: true, upsert: true });
    res.json({ success: true, message: "Delivery charges updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updatePaymentMethods = async (req, res) => {
  try {
    const { methods } = req.body;
    const settings = await Settings.findOneAndUpdate({}, { paymentMethods: methods }, { new: true, upsert: true });
    res.json({ success: true, message: "Payment methods updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const { enabled, email, sms, push } = req.body;
    const settings = await Settings.findOneAndUpdate({}, { 
      notificationsEnabled: enabled,
      emailNotifications: email,
      smsNotifications: sms,
      pushNotifications: push
    }, { new: true, upsert: true });
    res.json({ success: true, message: "Notification settings updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.toggleMaintenanceMode = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const newMode = !settings.maintenanceMode;
    const updated = await Settings.findOneAndUpdate({}, { maintenanceMode: newMode }, { new: true, upsert: true });
    res.json({ success: true, message: `Maintenance mode ${newMode ? "enabled" : "disabled"}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};