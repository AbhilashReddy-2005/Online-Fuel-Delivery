const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const Fleet = require('../models/Fleet');
const Payment = require('../models/Payment');
const Pricing = require('../models/Pricing');
const Order = require('../models/Order');

// ============================================================
//  HELPER
// ============================================================
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ============================================================
//  DRIVERS
// ============================================================

// GET /admin/drivers
exports.getAllDrivers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [drivers, total] = await Promise.all([
    Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Driver.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: drivers
  });
});

// GET /admin/drivers/:id
exports.getDriverById = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id).populate('assignedVehicle');
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.status(200).json({ success: true, data: driver });
});

// POST /admin/drivers
exports.createDriver = asyncHandler(async (req, res) => {
  const existing = await Driver.findOne({ email: req.body.email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  if (!req.body.driverId) {
    req.body.driverId = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const driver = await Driver.create(req.body);
  res.status(201).json({ success: true, message: 'Driver created successfully', data: driver });
});

// PUT /admin/drivers/:id
exports.updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.status(200).json({ success: true, message: 'Driver updated successfully', data: driver });
});

// DELETE /admin/drivers/:id
exports.deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.status(200).json({ success: true, message: 'Driver deleted successfully' });
});

// PATCH /admin/drivers/:id/status
exports.updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['available', 'on_delivery', 'off_duty', 'suspended'];
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status value' });

  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.status(200).json({ success: true, message: 'Driver status updated', data: driver });
});

// ============================================================
//  CUSTOMERS
// ============================================================

// GET /admin/customers
exports.getAllCustomers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [customers, total] = await Promise.all([
    Customer.find(query)
      .select('-password -emailOtp -emailOtpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Customer.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: customers
  });
});

// GET /admin/customers/:id
exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).select('-password -emailOtp -emailOtpExpiry');
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

  const orders = await Order.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderId status totalAmount createdAt');

  res.status(200).json({ success: true, data: { customer, recentOrders: orders } });
});

// PUT /admin/customers/:id
exports.updateCustomer = asyncHandler(async (req, res) => {
  // Prevent password update from here
  delete req.body.password;
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
});

// PATCH /admin/customers/:id/status
exports.updateCustomerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'inactive', 'suspended', 'blocked'];
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status value' });

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).select('-password');
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.status(200).json({ success: true, message: 'Customer status updated', data: customer });
});

// DELETE /admin/customers/:id
exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.status(200).json({ success: true, message: 'Customer deleted successfully' });
});

// ============================================================
//  INVENTORY
// ============================================================

// GET /admin/inventory
exports.getAllInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find().sort({ fuelType: 1 });
  const summary = {
    totalFuelTypes: inventory.length,
    lowStockAlerts: inventory.filter(i => i.currentStock <= i.minStockLevel).length,
    outOfStock: inventory.filter(i => i.currentStock === 0).length
  };
  res.status(200).json({ success: true, summary, data: inventory });
});

// GET /admin/inventory/:id
exports.getInventoryById = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
  res.status(200).json({ success: true, data: item });
});

// POST /admin/inventory
exports.createInventory = asyncHandler(async (req, res) => {
  const existing = await Inventory.findOne({ fuelType: req.body.fuelType });
  if (existing) return res.status(400).json({ success: false, message: 'Fuel type already exists in inventory' });

  const item = await Inventory.create(req.body);
  res.status(201).json({ success: true, message: 'Inventory item created', data: item });
});

// PUT /admin/inventory/:id
exports.updateInventory = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
  res.status(200).json({ success: true, message: 'Inventory updated', data: item });
});

// POST /admin/inventory/:id/restock
exports.restockInventory = asyncHandler(async (req, res) => {
  const { quantity, note, supplier } = req.body;
  if (!quantity || quantity <= 0)
    return res.status(400).json({ success: false, message: 'Valid quantity is required' });

  const item = await Inventory.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });

  if (item.currentStock + quantity > item.maxCapacity)
    return res.status(400).json({
      success: false,
      message: `Restock would exceed max capacity of ${item.maxCapacity} litres`
    });

  item.currentStock += quantity;
  item.lastRestocked = new Date();
  item.lastRestockedQuantity = quantity;
  if (supplier) item.supplier = supplier;

  item.stockHistory.push({
    action: 'restock',
    quantity,
    note: note || 'Manual restock',
    performedBy: req.admin ? req.admin._id : null,
    date: new Date()
  });

  await item.save();
  res.status(200).json({ success: true, message: `Restocked ${quantity} litres of ${item.fuelType}`, data: item });
});

// DELETE /admin/inventory/:id
exports.deleteInventory = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
  res.status(200).json({ success: true, message: 'Inventory item deleted' });
});

// ============================================================
//  FLEET
// ============================================================

// GET /admin/fleet
exports.getAllFleet = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [vehicles, total] = await Promise.all([
    Fleet.find(query)
      .populate('assignedDriver', 'name phone status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Fleet.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: vehicles
  });
});

// GET /admin/fleet/:id
exports.getFleetById = asyncHandler(async (req, res) => {
  const vehicle = await Fleet.findById(req.params.id).populate('assignedDriver', 'name phone email status');
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.status(200).json({ success: true, data: vehicle });
});

// POST /admin/fleet
exports.createFleet = asyncHandler(async (req, res) => {
  const existing = await Fleet.findOne({ vehicleNumber: req.body.vehicleNumber.toUpperCase() });
  if (existing) return res.status(400).json({ success: false, message: 'Vehicle number already registered' });

  const vehicle = await Fleet.create(req.body);
  res.status(201).json({ success: true, message: 'Vehicle added to fleet', data: vehicle });
});

// PUT /admin/fleet/:id
exports.updateFleet = asyncHandler(async (req, res) => {
  const vehicle = await Fleet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.status(200).json({ success: true, message: 'Vehicle updated successfully', data: vehicle });
});

// PATCH /admin/fleet/:id/assign-driver
exports.assignDriverToVehicle = asyncHandler(async (req, res) => {
  const { driverId } = req.body;

  const [vehicle, driver] = await Promise.all([
    Fleet.findById(req.params.id),
    Driver.findById(driverId)
  ]);

  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

  // Unassign previous driver if any
  if (vehicle.assignedDriver) {
    await Driver.findByIdAndUpdate(vehicle.assignedDriver, { assignedVehicle: null });
  }

  vehicle.assignedDriver = driverId;
  driver.assignedVehicle = req.params.id;

  await Promise.all([vehicle.save(), driver.save()]);
  res.status(200).json({ success: true, message: 'Driver assigned to vehicle', data: vehicle });
});

// PATCH /admin/fleet/:id/status
exports.updateFleetStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['available', 'in_service', 'maintenance', 'retired'];
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status value' });

  const vehicle = await Fleet.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.status(200).json({ success: true, message: 'Fleet status updated', data: vehicle });
});

// POST /admin/fleet/:id/maintenance
exports.addMaintenanceRecord = asyncHandler(async (req, res) => {
  const vehicle = await Fleet.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

  vehicle.maintenanceHistory.push(req.body);
  vehicle.lastServiceDate = new Date();
  if (req.body.nextServiceDate) vehicle.nextServiceDue = req.body.nextServiceDate;
  vehicle.status = 'maintenance';

  await vehicle.save();
  res.status(200).json({ success: true, message: 'Maintenance record added', data: vehicle });
});

// DELETE /admin/fleet/:id
exports.deleteFleet = asyncHandler(async (req, res) => {
  const vehicle = await Fleet.findByIdAndDelete(req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.status(200).json({ success: true, message: 'Vehicle removed from fleet' });
});

// ============================================================
//  PAYMENTS
// ============================================================

// GET /admin/payments
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { status, method, startDate, endDate, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (method) query.paymentMethod = method;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total, revenue] = await Promise.all([
    Payment.find(query)
      .populate('user', 'name email phone')
      .populate('order', 'orderId status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Payment.countDocuments(query),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    total,
    totalRevenue: revenue[0]?.total || 0,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: payments
  });
});

// GET /admin/payments/:id
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('order');
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  res.status(200).json({ success: true, data: payment });
});

// PATCH /admin/payments/:id/refund
exports.processRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  if (payment.status !== 'completed')
    return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });

  payment.status = 'refunded';
  payment.refundReason = reason || 'Admin initiated refund';
  payment.refundedAt = new Date();
  await payment.save();

  res.status(200).json({ success: true, message: 'Refund processed successfully', data: payment });
});

// GET /admin/payments/stats
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyRevenue, weeklyRevenue, monthlyRevenue, methodBreakdown] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      daily: dailyRevenue[0] || { total: 0, count: 0 },
      weekly: weeklyRevenue[0] || { total: 0, count: 0 },
      monthly: monthlyRevenue[0] || { total: 0, count: 0 },
      byMethod: methodBreakdown
    }
  });
});

// ============================================================
//  PRICING
// ============================================================

// GET /admin/pricing
exports.getAllPricing = asyncHandler(async (req, res) => {
  const pricing = await Pricing.find().sort({ fuelType: 1 });
  res.status(200).json({ success: true, data: pricing });
});

// GET /admin/pricing/:id
exports.getPricingById = asyncHandler(async (req, res) => {
  const pricing = await Pricing.findById(req.params.id);
  if (!pricing) return res.status(404).json({ success: false, message: 'Pricing config not found' });
  res.status(200).json({ success: true, data: pricing });
});

// POST /admin/pricing
exports.createPricing = asyncHandler(async (req, res) => {
  const existing = await Pricing.findOne({ fuelType: req.body.fuelType });
  if (existing) return res.status(400).json({ success: false, message: 'Pricing for this fuel type already exists' });

  if (req.admin) req.body.updatedBy = req.admin._id;
  const pricing = await Pricing.create(req.body);
  res.status(201).json({ success: true, message: 'Pricing created successfully', data: pricing });
});

// PUT /admin/pricing/:id
exports.updatePricing = asyncHandler(async (req, res) => {
  if (req.admin) req.body.updatedBy = req.admin._id;
  req.body.effectiveFrom = new Date();

  const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!pricing) return res.status(404).json({ success: false, message: 'Pricing config not found' });
  res.status(200).json({ success: true, message: 'Pricing updated successfully', data: pricing });
});

// DELETE /admin/pricing/:id
exports.deletePricing = asyncHandler(async (req, res) => {
  const pricing = await Pricing.findByIdAndDelete(req.params.id);
  if (!pricing) return res.status(404).json({ success: false, message: 'Pricing config not found' });
  res.status(200).json({ success: true, message: 'Pricing config deleted' });
});

// PATCH /admin/pricing/:id/discount
exports.addDiscount = asyncHandler(async (req, res) => {
  const pricing = await Pricing.findById(req.params.id);
  if (!pricing) return res.status(404).json({ success: false, message: 'Pricing config not found' });

  pricing.discounts.push(req.body);
  await pricing.save();
  res.status(200).json({ success: true, message: 'Discount added', data: pricing });
});

// ============================================================
//  DASHBOARD SUMMARY
// ============================================================

// GET /admin/dashboard/summary
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalDrivers,
    availableDrivers,
    totalCustomers,
    activeCustomers,
    totalVehicles,
    vehiclesInService,
    inventory,
    ordersToday,
    revenueToday,
    pendingOrders,
    activeDeliveries
  ] = await Promise.all([
    Driver.countDocuments({ isActive: true }),
    Driver.countDocuments({ status: 'available', isActive: true }),
    Customer.countDocuments({ isActive: true }),
    Customer.countDocuments({ status: 'active' }),
    Fleet.countDocuments({ isActive: true }),
    Fleet.countDocuments({ status: 'in_service' }),
    Inventory.find().select('fuelType currentStock minStockLevel'),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: { $in: ['assigned', 'in_transit'] } })
  ]);

  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStockLevel);

  res.status(200).json({
    success: true,
    data: {
      drivers: { total: totalDrivers, available: availableDrivers },
      customers: { total: totalCustomers, active: activeCustomers },
      fleet: { total: totalVehicles, inService: vehiclesInService },
      inventory: { lowStockAlerts: lowStockItems.length, items: lowStockItems },
      orders: {
        today: ordersToday,
        pending: pendingOrders,
        activeDeliveries
      },
      revenue: { today: revenueToday[0]?.total || 0 }
    }
  });
});

// ============================================================
//  REPORTS DASHBOARD (Real-time stats for the Reports page)
// ============================================================

exports.getReportsDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    ordersToday,
    pendingOrders,
    confirmedOrders,
    inTransitOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    revenueToday,
    totalCustomers,
    revenueByFuel,
    topDrivers
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: 'Confirmed' }),
    Order.countDocuments({ status: 'In Transit' }),
    Order.countDocuments({ status: 'Delivered' }),
    Order.countDocuments({ status: 'Cancelled' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Customer.countDocuments(),
    Order.aggregate([
      { $match: { status: 'Delivered', amount: { $gt: 0 } } },
      { $group: { _id: '$fuelType', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Driver.find({ isActive: true })
      .select('name driverId deliveriesCompleted status')
      .sort({ deliveriesCompleted: -1 })
      .limit(5)
  ]);

  // Calculate total revenue from orders if Payment model has no data
  const totalRevenueFromOrders = await Order.aggregate([
    { $match: { amount: { $gt: 0 }, status: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const revTotal = totalRevenue[0]?.total || totalRevenueFromOrders[0]?.total || 0;
  const revToday = revenueToday[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      orders: {
        total: totalOrders,
        today: ordersToday,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        inTransit: inTransitOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: revTotal,
        today: revToday
      },
      customers: {
        total: totalCustomers
      },
      revenueByFuel,
      topDrivers
    }
  });
});