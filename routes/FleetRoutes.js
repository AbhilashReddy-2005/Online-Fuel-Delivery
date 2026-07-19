const express = require("express");
const router = express.Router();
const fleetController = require("../controllers/FleetController");

console.log("✅ Fleet routes loaded");

// Get all vehicles
router.get("/", fleetController.getAllFleet);

// Get single vehicle
router.get("/:id", fleetController.getVehicle);

// Create vehicle
router.post("/", fleetController.createVehicle);

// Update vehicle
router.put("/:id", fleetController.updateVehicle);

// Delete vehicle
router.delete("/:id", fleetController.deleteVehicle);

// Update status
router.patch("/:id/status", fleetController.updateStatus);

// Update fuel level
router.patch("/:id/fuel-level", fleetController.updateFuelLevel);

module.exports = router;