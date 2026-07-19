const Tracking = require("../models/Tracking");
const Order = require("../models/Order");

console.log("✅ TrackingController.js loaded");

exports.getAllTracking = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    let query = {};
    if (status) query.status = status;

    const tracking = await Tracking.find(query).limit(Number(limit)).skip(Number(skip)).sort({ createdAt: -1 });
    const total = await Tracking.countDocuments(query);

    res.json({ success: true, data: tracking, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findById(req.params.id);
    if (!tracking) return res.status(404).json({ success: false, message: "Tracking not found" });
    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.createTracking = async (req, res) => {
  try {
    const { orderId, driverId, driverName, customerLocation, deliveryLocation, estimatedTime, status } = req.body;

    if (!orderId || !driverId || !customerLocation || !deliveryLocation) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newTracking = new Tracking({
      orderId,
      driverId,
      driverName: driverName || "Unassigned",
      customerLocation,
      deliveryLocation,
      currentLocation: customerLocation,
      estimatedTime: estimatedTime || new Date(Date.now() + 60 * 60000),
      status: status || "picked-up",
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newTracking.save();
    res.status(201).json({ success: true, message: "Tracking created", data: newTracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const tracking = await Tracking.findByIdAndUpdate(req.params.id, {
      currentLocation: { latitude, longitude },
      updatedAt: new Date()
    }, { new: true });

    if (!tracking) return res.status(404).json({ success: false, message: "Tracking not found" });
    res.json({ success: true, message: "Location updated", data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["picked-up", "in-transit", "delivered", "failed"];
    
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const tracking = await Tracking.findByIdAndUpdate(req.params.id, {
      status,
      updatedAt: new Date()
    }, { new: true });

    if (!tracking) return res.status(404).json({ success: false, message: "Tracking not found" });
    
    // Update order status if delivered
    if (status === "delivered") {
      await Order.findByIdAndUpdate(tracking.orderId, { status: "completed" });
    }

    res.json({ success: true, message: "Status updated", data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { driverId, driverName } = req.body;
    const tracking = await Tracking.findByIdAndUpdate(req.params.id, {
      driverId,
      driverName,
      updatedAt: new Date()
    }, { new: true });

    if (!tracking) return res.status(404).json({ success: false, message: "Tracking not found" });
    res.json({ success: true, message: "Driver assigned", data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getTrackingByOrder = async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ orderId: req.params.orderId });
    if (!tracking) return res.status(404).json({ success: false, message: "Tracking not found" });
    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getOngoingDeliveries = async (req, res) => {
  try {
    const tracking = await Tracking.find({ status: { $in: ["picked-up", "in-transit"] } });
    res.json({ success: true, data: tracking, count: tracking.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};