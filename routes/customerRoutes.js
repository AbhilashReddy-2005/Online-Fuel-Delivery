const express = require("express");
const router = express.Router();
const customerController = require("../controllers/CustomerController");

console.log("✅ Customer routes loaded");

// Get all customers
router.get("/", customerController.getAllCustomers);

// Get single customer
router.get("/:id", customerController.getCustomer);

// Create customer
router.post("/", customerController.createCustomer);

// Update customer
router.put("/:id", customerController.updateCustomer);

// Delete customer
router.delete("/:id", customerController.deleteCustomer);

// Update fuel level
router.patch("/:id/fuel-level", customerController.updateFuelLevel);

module.exports = router;
