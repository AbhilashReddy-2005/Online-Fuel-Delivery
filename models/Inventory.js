const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel"],
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  minimumLevel: {
    type: Number,
    required: true,
    default: 500
  },
  maximumLevel: {
    type: Number,
    required: true,
    default: 10000
  },
  unit: {
    type: String,
    enum: ["Liters", "Gallons"],
    default: "Liters"
  },
  pricePerUnit: {
    type: Number,
    required: true,
    default: 100
  },
  supplier: String,
  lastRestockDate: Date,
  lastRestockQuantity: Number,
  status: {
    type: String,
    enum: ["in-stock", "low-stock", "critical", "out-of-stock"],
    default: "in-stock"
  },
  monthlyUsage: Number,
  totalSoldThisMonth: {
    type: Number,
    default: 0
  },
  wastePercentage: {
    type: Number,
    default: 0
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

module.exports = mongoose.model("Inventory", inventorySchema);