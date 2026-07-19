const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel"],
    required: true,
    unique: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  deliveryFares: {
    within5km: Number,
    within10km: Number,
    within15km: Number,
    beyond15km: Number
  },
  zonePricing: [{
    zone: String,
    priceMultiplier: Number
  }],
  surgeCharges: {
    peakHours: {
      startTime: String,
      endTime: String,
      surgePercentage: Number
    }
  },
  discounts: [{
    discountName: String,
    discountPercentage: Number,
    validFrom: Date,
    validUpto: Date,
    applicableTo: String,
    active: Boolean
  }],
  bulkPricing: [{
    minQuantity: Number,
    maxQuantity: Number,
    discountPercentage: Number
  }],
  minimumOrderValue: Number,
  deliveryCharges: Number,
  taxPercentage: Number,
  effectiveDate: {
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

module.exports = mongoose.model("Pricing", pricingSchema);