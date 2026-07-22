
const Order = require("../models/Order");

console.log("✅ OrderController.js loaded");

/**
 * GET all orders with pagination and filtering
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, fuelType, limit = 50, skip = 0 } = req.query;

    let query = {};
    if (status)   query.status   = status;
    if (fuelType) query.fuelType = fuelType;

    const orders = await Order.find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data:    orders,
      total:   total,
      page:    Math.floor(Number(skip) / Number(limit)) + 1,
      pages:   Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * GET single order by ID
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * CREATE new order
 * ✅ FIX: now saves customerName and customerPhone
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      fuelType,
      quantity,
      location,
      paymentMethod,
      latitude,
      longitude,
      customerName,   // ✅ NEW — sent by order.js
      customerPhone   // ✅ NEW — sent by order.js
    } = req.body;

    // Validate required fields
    if (!fuelType || !quantity || !location || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fuelType, quantity, location, paymentMethod"
      });
    }

    // Generate unique order number
    const timestamp   = Date.now();
    const random      = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = `ORD-${timestamp}-${random}`;

    const newOrder = new Order({
      orderNumber,
      fuelType,
      quantity:      Number(quantity),
      location,
      paymentMethod,
      latitude,
      longitude,
      customerName:  customerName  || "Customer",   // ✅
      customerPhone: customerPhone || "",            // ✅
      status:        "Pending"
    });

    await newOrder.save();

    res.status(201).json({
      success:     true,
      message:     "Order created successfully",
      orderId:     newOrder._id,          // ✅ used by order.js for redirect
      orderNumber: newOrder.orderNumber,
      data:        newOrder
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error: " + err.message
    });
  }
};

/**
 * UPDATE order (full update)
 */
exports.updateOrder = async (req, res) => {
  try {
    const {
      customerName, customerPhone, fuelType,
      quantity, amount, status, deliveryAddress
    } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { customerName, customerPhone, fuelType, quantity, amount, status, deliveryAddress, updatedAt: new Date() },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order updated", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * DELETE order
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order deleted", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * UPDATE order status only
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Pending", "Confirmed", "Payment Completed",
      "In Transit", "Delivered", "Cancelled"
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Status updated", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * GET order statistics (for admin dashboard KPIs)
 */
exports.getStatistics = async (req, res) => {
  try {
    const orders = await Order.find();

    const stats = {
      totalOrders:    orders.length,
      totalRevenue:   orders.reduce((sum, o) => sum + (o.amount   || 0), 0),
      totalQuantity:  orders.reduce((sum, o) => sum + (o.quantity || 0), 0),
      pendingOrders:          orders.filter(o => o.status === "Pending").length,
      confirmedOrders:        orders.filter(o => o.status === "Confirmed").length,
      paymentCompletedOrders: orders.filter(o => o.status === "Payment Completed").length,
      inTransitOrders:        orders.filter(o => o.status === "In Transit").length,
      deliveredOrders:        orders.filter(o => o.status === "Delivered").length,
      cancelledOrders:        orders.filter(o => o.status === "Cancelled").length,
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length
        : 0
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * GET orders by customer phone
 */
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const orders = await Order.find({ customerPhone }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

/**
 * GET orders by date range
 */
exports.getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};