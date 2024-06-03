const { Router } = require('express');
const router = Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const userDAO = require('../dao/user');
const combatantDAO = require('../dao/combatant');
const isAdmin = require('../middleware/isAdmin');

// Create a new combatant
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, initiative, hitpoints } = req.body;
        const newCombatant = await combatantDAO.createCombatant(name, initiative, hitpoints);
        res.status(200).json(newCombatant);
    } catch (error) {
        console.error("Could not create combatant", error);
        res.status(500).send("Internal server error");
    }
});

// Update an existing combatant
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, initiative, hitpoints } = req.body;
        const id = req.params.id;

        // Check if name, initiative, and hitpoints are provided
        if (!name || !initiative || !hitpoints) {
            return res.status(400).send('Name, initiative, and hitpoints are required');
        }

        // Check if initiative is a valid number
        if (isNaN(parseFloat(initiative)) || !isFinite(initiative)) {
            return res.status(400).send('Initiative must be a valid number');
        }

        // Check if hitpoints is a valid number
        if (isNaN(parseFloat(hitpoints)) || !isFinite(hitpoints)) {
            return res.status(400).send('Hitpoints must be a valid number');
        }

        const updatedCombatant = await combatantDAO.updateCombatantById(id, name, initiative, hitpoints);
        res.status(200).json(updatedCombatant);
    } catch (error) {
        console.error("Error updating combatant:", error);
        res.status(500).send("Internal server error");
    }
});

router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        const result = await combatantDAO.deleteCombatantById(id);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting combatant:", error);

        if (error.message === "Combatant not found!") {
            res.status(404).json({ error: error.message });
        } else if (error.message === "Cannot delete combatant as it is still in use by an encounter.") {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).send("Internal server error");
        }
    }
});

// Get a specific combatant by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const combatant = await combatantDAO.getCombatantsById(id);
        res.status(200).json(combatant);
    } catch (error) {
        console.error("Error retrieving combatant:", error);
        res.status(500).send("Internal server error");
    }
});

// Get all combatants
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await userDAO.getUserById(req.userId);
        const combatants = await combatantDAO.getAllCombatants();
        res.status(200).json(combatants);
    } catch (error) {
        console.error("Could not retrieve combatants:", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
