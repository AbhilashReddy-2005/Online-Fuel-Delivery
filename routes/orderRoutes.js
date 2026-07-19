const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const Order = require('../models/Order');

// GET all orders (paginated, filterable)
router.get('/', OrderController.getAllOrders);

// GET orders that have been paid (paymentStatus = Paid)
router.get('/paid', async (req, res) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: 'Paid' })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, count: paidOrders.length, data: paidOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order
router.get('/:id', OrderController.getOrder);

// CREATE new order
router.post('/', OrderController.createOrder);

// UPDATE order
router.put('/:id', OrderController.updateOrder);

// DELETE order
router.delete('/:id', OrderController.deleteOrder);

// UPDATE order status
router.patch('/:id/status', OrderController.updateOrderStatus);

// GET order statistics
router.get('/stats/overview', OrderController.getStatistics);

// GET orders by customer
router.get('/customer/:customerPhone', OrderController.getOrdersByCustomer);

// GET orders by date range
router.get('/date-range/filter', OrderController.getOrdersByDateRange);

module.exports = router;