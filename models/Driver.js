const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseExpiry: Date,
  vehicle: {
    type: String,
    enum: ["Bike", "Auto", "Van", "Truck"],
    default: "Bike"
  },
  vehicleNumber: String,
  status: {
    type: String,
    enum: ["active", "inactive", "on-break"],
    default: "active"
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  deliveriesCompleted: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  location: String,
  profileImage: String,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Driver", driverSchema);