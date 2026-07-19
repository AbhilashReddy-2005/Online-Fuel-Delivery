const Inventory = require("../models/Inventory");

console.log("✅ InventoryController.js loaded");

/**
 * GET all inventory items
 * Query params: ?fuelType=petrol&status=in-stock&limit=50&skip=0
 */
exports.getAllInventory = async (req, res) => {
  try {
    const { fuelType, status, limit = 50, skip = 0 } = req.query;
    
    let query = {};
    if (fuelType) query.fuelType = fuelType;
    if (status) query.status = status;

    const items = await Inventory.find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: items,
      total: total,
      page: Math.floor(Number(skip) / Number(limit)) + 1,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching inventory: " + err.message
    });
  }
};

/**
 * GET single inventory item
 */
exports.getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching inventory item: " + err.message
    });
  }
};

/**
 * CREATE new inventory item
 */
exports.createInventoryItem = async (req, res) => {
  try {
    const {
      fuelType,
      quantity,
      unit,
      pricePerUnit,
      minThreshold,
      supplier,
      location,
      status
    } = req.body;

    // Validation
    if (!fuelType || !quantity || !unit || !pricePerUnit || !minThreshold || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fuelType, quantity, unit, pricePerUnit, minThreshold, status"
      });
    }

    // Validate fuel type
    const validFuelTypes = ["petrol", "diesel", "lpg"];
    if (!validFuelTypes.includes(fuelType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fuel type. Must be: petrol, diesel, or lpg"
      });
    }

    // Validate status
    const validStatus = ["in-stock", "low-stock", "out-of-stock"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: in-stock, low-stock, or out-of-stock"
      });
    }

    // Check if inventory already exists for this fuel type at location
    const existing = await Inventory.findOne({
      fuelType,
      location: location || "Default"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Inventory for ${fuelType} already exists at this location`
      });
    }

    // Create new inventory
    const newItem = new Inventory({
      fuelType,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      minThreshold: Number(minThreshold),
      supplier: supplier || "Not Specified",
      location: location || "Default",
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: newItem
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating inventory: " + err.message
    });
  }
};

/**
 * UPDATE inventory item
 */
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fuelType,
      quantity,
      unit,
      pricePerUnit,
      minThreshold,
      supplier,
      location,
      status
    } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    // Validate status if provided
    if (status) {
      const validStatus = ["in-stock", "low-stock", "out-of-stock"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be: in-stock, low-stock, or out-of-stock"
        });
      }
    }

    // Update fields
    if (fuelType) item.fuelType = fuelType;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (pricePerUnit !== undefined) item.pricePerUnit = Number(pricePerUnit);
    if (minThreshold !== undefined) item.minThreshold = Number(minThreshold);
    if (supplier) item.supplier = supplier;
    if (location) item.location = location;
    if (status) item.status = status;

    item.updatedAt = new Date();

    await item.save();

    res.json({
      success: true,
      message: "Inventory item updated successfully",
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating inventory: " + err.message
    });
  }
};

/**
 * DELETE inventory item
 */
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting inventory: " + err.message
    });
  }
};

/**
 * UPDATE stock quantity
 * PATCH /api/inventory/:id/stock
 * Body: { action: "add" or "subtract", quantity: 100 }
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity } = req.body;

    if (!action || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: action (add/subtract), quantity"
      });
    }

    if (!["add", "subtract"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'add' or 'subtract'"
      });
    }

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    const qty = Number(quantity);

    if (action === "add") {
      item.quantity += qty;
    } else if (action === "subtract") {
      if (item.quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${item.quantity}L, Requested: ${qty}L`
        });
      }
      item.quantity -= qty;
    }

    // Auto-update status based on quantity
    if (item.quantity === 0) {
      item.status = "out-of-stock";
    } else if (item.quantity < item.minThreshold) {
      item.status = "low-stock";
    } else {
      item.status = "in-stock";
    }

    item.updatedAt = new Date();
    await item.save();

    res.json({
      success: true,
      message: `Stock ${action === "add" ? "added" : "removed"} successfully`,
      data: item,
      previousQuantity: action === "add" ? item.quantity - qty : item.quantity + qty,
      currentQuantity: item.quantity
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating stock: " + err.message
    });
  }
};

/**
 * GET inventory statistics
 * GET /api/inventory/stats/overview
 */
exports.getStatistics = async (req, res) => {
  try {
    const allItems = await Inventory.find();

    let totalQuantity = 0;
    let totalValue = 0;
    let fuelStats = {
      petrol: { quantity: 0, value: 0, items: 0 },
      diesel: { quantity: 0, value: 0, items: 0 },
      lpg: { quantity: 0, value: 0, items: 0 }
    };

    let statusCount = {
      "in-stock": 0,
      "low-stock": 0,
      "out-of-stock": 0
    };

    allItems.forEach(item => {
      const itemValue = item.quantity * item.pricePerUnit;
      
      totalQuantity += item.quantity;
      totalValue += itemValue;

      if (fuelStats[item.fuelType]) {
        fuelStats[item.fuelType].quantity += item.quantity;
        fuelStats[item.fuelType].value += itemValue;
        fuelStats[item.fuelType].items += 1;
      }

      statusCount[item.status]++;
    });

    // Calculate low stock items
    const lowStockItems = allItems.filter(item => item.status === "low-stock");
    const outOfStockItems = allItems.filter(item => item.status === "out-of-stock");

    res.json({
      success: true,
      data: {
        totalItems: allItems.length,
        totalQuantity: totalQuantity,
        totalValue: totalValue.toFixed(2),
        fuelStats: fuelStats,
        statusCount: statusCount,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        averagePrice: allItems.length > 0 ? (totalValue / totalQuantity).toFixed(2) : 0,
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics: " + err.message
    });
  }
};

/**
 * GET inventory by fuel type
 * GET /api/inventory/fuel/:fuelType
 */
exports.getByFuelType = async (req, res) => {
  try {
    const { fuelType } = req.params;

    const validFuelTypes = ["petrol", "diesel", "lpg"];
    if (!validFuelTypes.includes(fuelType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fuel type. Must be: petrol, diesel, or lpg"
      });
    }

    const items = await Inventory.find({ fuelType }).sort({ createdAt: -1 });

    let totalQuantity = 0;
    let totalValue = 0;

    items.forEach(item => {
      totalQuantity += item.quantity;
      totalValue += item.quantity * item.pricePerUnit;
    });

    res.json({
      success: true,
      data: items,
      summary: {
        fuelType: fuelType,
        totalItems: items.length,
        totalQuantity: totalQuantity,
        totalValue: totalValue.toFixed(2),
        avgPrice: items.length > 0 ? (totalValue / totalQuantity).toFixed(2) : 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching inventory by fuel type: " + err.message
    });
  }
};

/**
 * BULK UPDATE status
 * PATCH /api/inventory/bulk/status
 * Body: { ids: ["id1", "id2"], status: "in-stock" }
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: ids (array), status"
      });
    }

    const validStatus = ["in-stock", "low-stock", "out-of-stock"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: in-stock, low-stock, or out-of-stock"
      });
    }

    const result = await Inventory.updateMany(
      { _id: { $in: ids } },
      { status: status, updatedAt: new Date() }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} items`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating inventory: " + err.message
    });
  }
};

/**
 * LOW STOCK ALERT
 * GET /api/inventory/alerts/low-stock
 */
exports.getLowStockAlerts = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lt: ["$quantity", "$minThreshold"] }
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      message: items.length > 0 ? `${items.length} items below minimum threshold` : "All items well-stocked"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching low stock alerts: " + err.message
    });
  }
};

/**
 * EXPIRY MANAGEMENT
 * Can be extended to track fuel expiry dates
 */
exports.getExpiryAlerts = async (req, res) => {
  try {
    // Extended functionality for future
    res.json({
      success: true,
      data: [],
      message: "Expiry tracking not yet configured"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching expiry alerts: " + err.message
    });
  }
};