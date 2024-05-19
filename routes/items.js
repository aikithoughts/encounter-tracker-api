const { Router } = require('express');
const router = Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const userDAO = require('../dao/user');
const itemDAO = require('../dao/item');
const isAdmin = require('../middleware/isAdmin');

// Create a new item
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, price } = req.body;
        const newItem = await itemDAO.createItem(title, price);
        res.status(200).json(newItem);
    } catch (error) {
        console.error("Could not create item", error);
        res.status(500).send("Internal server error");
    }
});

// Update an existing item
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, price } = req.body;
        const id = req.params.id;

        // Check if title and price are provided
        if (!title || !price) {
            return res.status(400).send('Title and price are required');
        }

        // Check if price is a valid number
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            return res.status(400).send('Price must be a valid number');
        }

        const newItem = await itemDAO.updateItemById(id, title, price);
        res.status(200).json(newItem);
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).send("Internal server error");
    }
});


// Get a specific item by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const newItem = await itemDAO.getItemById(id);
        res.status(200).json(newItem);
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).send("Internal server error");
    }
});

// Get all items
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await userDAO.getUserById(req.userId);
        const items = await itemDAO.getAllItems();
        res.status(200).json(items);
    } catch (error) {
        console.error("Could not retreive items: ", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
