const Customer = require("../models/Customer");

console.log("✅ Customer Controller loaded");

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({
      success: true,
      data: customers,
      count: customers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single customer
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, fuelCapacity, status } = req.body;

    if (!name || !email || !phone || !location || !fuelCapacity) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const customer = new Customer({
      name,
      email,
      phone,
      location,
      fuelCapacity,
      status: status || "active",
    });

    await customer.save();
    res.json({ success: true, message: "Customer created successfully", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, message: "Customer updated successfully", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update fuel level
exports.updateFuelLevel = async (req, res) => {
  try {
    const { currentLevel } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { currentLevel },
      { new: true }
    );
    res.json({ success: true, message: "Fuel level updated", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
