const { Router } = require('express');
const router = Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const orderDAO = require('../dao/order');
const itemDAO = require('../dao/item');
const userDAO = require('../dao/user')
const mongoose = require('mongoose');

// Calculate order cost
const calculateTotalCost = (items) => {
    let total = 0;
    items.forEach((item) => {
        total += item.price;
    })
    return total;
}

// Create a new order
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const itemIds = req.body;

        // Validate each item ID
        for (const itemId of itemIds) {
            if (!mongoose.Types.ObjectId.isValid(itemId)) {
                return res.status(400).send("Invalid item ID");
            }
        }

        // Fetch the item details from the database based on the item IDs
        const items = await Promise.all(itemIds.map(async (itemId) => {
            return await itemDAO.getItemById(itemId);
        }));

        // Calculate the total cost based on the prices of the fetched items
        const totalCost = calculateTotalCost(items);

        // Create the order with the fetched items and total cost
        const createdOrder = await orderDAO.createOrder(userId, items, totalCost);

        // Respond with the created order
        res.status(200).json(createdOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send("Internal server error");
    }
});


// Update an existing order
router.put('/:id', isAuthenticated, async (req, res) => {
    const orderId = req.params.id;
    // Logic to update the order with the given ID
    res.status(200).send(`Updating order with ID ${orderId}`);
});

// Get a specific order by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;

        // Get the order
        const order = await orderDAO.getOrderById(orderId);

        const user = await userDAO.getUserById(userId);

        // Make sure order exists
        if (!order) {
            return res.status(404).send("Order not found.");
        }

        // Make sure the user is the owner of the order or has admin role
        if (order.userId.toString() !== userId && !user.roles.includes("admin")) {
            return res.status(404).send("Unauthorized request.");
        }

        // Return the order!
        res.status(200).json(order);

    } catch (error) {
        console.error('Error fetching order: ', error);
        res.status(500).send("Internal server error");
    }
});

// Get all orders
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await userDAO.getUserById(req.userId);

        if (user.roles.includes("admin")) { //admins get all orders
            const orders = await orderDAO.getAllOrders();
            res.status(200).json(orders);
        } else {
            const order = await orderDAO.getAllOrdersForUserId(req.userId);
            res.status(200).json(order);
        }
    } catch (error) {
        console.error("Could not retrieve order: ", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
