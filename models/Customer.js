const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  contactPerson: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  businessType: {
    type: String,
    enum: ["Petrol Station", "Diesel Station", "Industrial", "Commercial", "Residential"],
    default: "Petrol Station"
  },
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Both"],
    default: "Diesel"
  },
  tankCapacity: Number,
  currentFuelLevel: Number,
  monthlyConsumption: Number,
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "UPI", "Bank Transfer"],
    default: "Card"
  },
  creditLimit: {
    type: Number,
    default: 50000
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  lastOrderDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Customer", customerSchema);