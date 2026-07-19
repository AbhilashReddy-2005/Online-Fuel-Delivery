const Order = require("../models/Order");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const Inventory = require("../models/Inventory");

console.log("✅ ReportsController.js loaded");

exports.getRevenueReport = async (req, res) => {
  try {
    const orders = await Order.find({ status: "completed" });
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const monthlyRevenue = {};

    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('default', { year: 'numeric', month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.amount;
    });

    res.json({ success: true, data: { totalRevenue, monthlyRevenue, ordersCount: orders.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getOrdersReport = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const byStatus = {
      pending: allOrders.filter(o => o.status === "pending").length,
      confirmed: allOrders.filter(o => o.status === "confirmed").length,
      completed: allOrders.filter(o => o.status === "completed").length,
      cancelled: allOrders.filter(o => o.status === "cancelled").length
    };

    const byFuelType = {};
    allOrders.forEach(o => {
      byFuelType[o.fuelType] = (byFuelType[o.fuelType] || 0) + 1;
    });

    res.json({ success: true, data: { total: allOrders.length, byStatus, byFuelType } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const customers = await Customer.find();
    const orders = await Order.find();

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === "active").length;
    const topCustomers = orders.reduce((acc, order) => {
      const customer = acc.find(c => c.phone === order.customerPhone);
      if (customer) customer.orders++;
      else acc.push({ name: order.customerName, phone: order.customerPhone, orders: 1 });
      return acc;
    }, []).sort((a, b) => b.orders - a.orders).slice(0, 10);

    res.json({ success: true, data: { totalCustomers, activeCustomers, topCustomers } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    
    const byStatus = {
      "in-stock": inventory.filter(i => i.status === "in-stock").length,
      "low-stock": inventory.filter(i => i.status === "low-stock").length,
      "out-of-stock": inventory.filter(i => i.status === "out-of-stock").length
    };

    const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.pricePerUnit), 0);

    res.json({ success: true, data: { byStatus, totalValue, itemCount: inventory.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getDriverPerformance = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: "active" });
    const performance = drivers.map(d => ({
      name: d.name,
      totalTrips: d.totalTrips || 0,
      rating: d.rating || 5,
      status: d.status
    }));

    res.json({ success: true, data: { activeDrivers: drivers.length, performance } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();
    const customers = await Customer.find();
    const drivers = await Driver.find();
    const inventory = await Inventory.find();

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
      totalCustomers: customers.length,
      activeDrivers: drivers.filter(d => d.status === "active").length,
      lowStockItems: inventory.filter(i => i.status === "low-stock").length,
      completedOrders: orders.filter(o => o.status === "completed").length,
      pendingOrders: orders.filter(o => o.status === "pending").length
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};