const Pricing = require("../models/Pricing");

console.log("✅ Pricing Controller loaded");

// Get all pricing
exports.getAllPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find();
    res.json({
      success: true,
      data: pricing,
      count: pricing.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single pricing
exports.getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not found" });
    }
    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create pricing
exports.createPricing = async (req, res) => {
  try {
    const { fuelType, basePrice, deliveryFare, area, minOrderQuantity, discount, surgeMultiplier } = req.body;

    if (!fuelType || !basePrice || deliveryFare === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const pricing = new Pricing({
      fuelType,
      basePrice,
      deliveryFare,
      area,
      minOrderQuantity: minOrderQuantity || 1,
      discount: discount || 0,
      surgeMultiplier: surgeMultiplier || 1,
      status: "active",
    });

    await pricing.save();
    res.json({ success: true, message: "Pricing created", data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update pricing
exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not found" });
    }
    res.json({ success: true, message: "Pricing updated", data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete pricing
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not found" });
    }
    res.json({ success: true, message: "Pricing deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, message: "Status updated", data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pricing by fuel type
exports.getPricingByFuelType = async (req, res) => {
  try {
    const { fuelType } = req.params;
    const pricing = await Pricing.find({ fuelType, status: "active" });
    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};