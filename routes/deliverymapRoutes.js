const express = require('express');
const router = express.Router();
const DeliveryMapController = require('../controllers/DeliveryMapController');

// Auth middleware
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.token = token;
  next();
});

// GET all map deliveries
router.get('/deliveries', DeliveryMapController.getMapDeliveries);

// GET single map delivery
router.get('/deliveries/:id', DeliveryMapController.getMapDelivery);

// GET delivery statistics
router.get('/stats/overview', DeliveryMapController.getDeliveryStats);

// GET nearby deliveries (within radius)
router.get('/nearby', DeliveryMapController.getNearbyDeliveries);

// GET heat map data
router.get('/heatmap/data', DeliveryMapController.getHeatMapData);

// UPDATE delivery location (GPS)
router.patch('/deliveries/:id/location', DeliveryMapController.updateDeliveryLocation);

module.exports = router;