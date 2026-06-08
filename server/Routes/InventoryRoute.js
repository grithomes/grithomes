const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

// Create new inventory item
router.post('/addinventory', async (req, res) => {
    try {
        const { materialName, description, unit, quantity, price, userid } = req.body;
        const newInventory = new Inventory({
            materialName,
            description,
            unit,
            quantity: quantity || 0,
            price: price || 0,
            userid
        });
        const savedInventory = await newInventory.save();

        // Optional: Create an initial transaction if quantity > 0
        if (quantity > 0) {
            const transaction = new InventoryTransaction({
                inventoryId: savedInventory._id,
                type: 'Restock',
                quantity: quantity,
                description: 'Initial Stock',
                userid
            });
            await transaction.save();
        }

        res.json({ success: true, inventory: savedInventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all inventory items for a user
router.get('/inventorydata/:userid', async (req, res) => {
    try {
        const inventoryData = await Inventory.find({ userid: req.params.userid }).sort({ createdAt: -1 });
        res.json(inventoryData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// Get single inventory item by id
router.get('/inventory/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// Update inventory item details
router.post('/editinventory/:id', async (req, res) => {
    try {
        const { materialName, description, unit, price } = req.body;
        // Note: quantity should typically be updated via transactions, but we can allow it here if needed.
        // For strict tracking, we only update other details.
        
        const updatedInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            { $set: { materialName, description, unit, price } },
            { new: true }
        );
        res.json({ success: true, inventory: updatedInventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete inventory item
router.get('/delinventory/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        // Also delete related transactions
        await InventoryTransaction.deleteMany({ inventoryId: req.params.id });
        res.json({ Success: true, message: 'Inventory item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ Success: false, message: 'Server error' });
    }
});

// Add a transaction (Restock or Usage)
router.post('/inventory/transaction', async (req, res) => {
    try {
        const { inventoryId, type, quantity, description, userid, date } = req.body;
        
        if (!inventoryId || !type || !quantity || !userid) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const inventory = await Inventory.findById(inventoryId);
        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Inventory item not found' });
        }

        const transactionQuantity = Number(quantity);
        if (type === 'Usage' && inventory.quantity < transactionQuantity) {
            return res.status(400).json({ success: false, message: 'Not enough quantity in stock' });
        }

        const transaction = new InventoryTransaction({
            inventoryId,
            type,
            quantity: transactionQuantity,
            description,
            userid,
            date: date || Date.now()
        });
        await transaction.save();

        // Update inventory quantity
        if (type === 'Restock') {
            inventory.quantity += transactionQuantity;
        } else if (type === 'Usage') {
            inventory.quantity -= transactionQuantity;
        }
        await inventory.save();

        res.json({ success: true, transaction, updatedQuantity: inventory.quantity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get transactions for a specific inventory item
router.get('/inventory/transactions/:inventoryId', async (req, res) => {
    try {
        const transactions = await InventoryTransaction.find({ inventoryId: req.params.inventoryId }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
