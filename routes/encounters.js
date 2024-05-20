const { Router } = require('express');
const router = Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const encounterDAO = require('../dao/encounter');
const combatantDAO = require('../dao/combatant');
const userDAO = require('../dao/user');
const mongoose = require('mongoose');

// Create a new encounter
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const combatantIds = req.body;

        // Validate each combatant ID
        for (const combatantId of combatantIds) {
            if (!mongoose.Types.ObjectId.isValid(combatantId)) {
                return res.status(400).send("Invalid combatant ID");
            }
        }

        // Fetch the combatant details from the database based on the combatant IDs
        const combatants = await Promise.all(combatantIds.map(async (combatantId) => {
            return await combatantDAO.getCombatantsById(combatantId);
        }));

        // Create the encounter with the fetched combatants
        const createdEncounter = await encounterDAO.createEncounter(userId, combatants);

        // Respond with the created encounter
        res.status(200).json(createdEncounter);
    } catch (error) {
        console.error('Error creating encounter:', error);
        res.status(500).send("Internal server error");
    }
});

// Update an existing encounter
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const encounterId = req.params.id;
        const combatantIds = req.body;

        // Validate each combatant ID
        for (const combatantId of combatantIds) {
            if (!mongoose.Types.ObjectId.isValid(combatantId)) {
                return res.status(400).send("Invalid combatant ID");
            }
        }

        // Fetch the combatant details from the database based on the combatant IDs
        const combatants = await Promise.all(combatantIds.map(async (combatantId) => {
            return await combatantDAO.getCombatantsById(combatantId);
        }));

        // Update the encounter with the fetched combatants
        const updatedEncounter = await encounterDAO.updateEncounterById(encounterId, combatants);

        res.status(200).json(updatedEncounter);
    } catch (error) {
        console.error('Error updating encounter:', error);
        res.status(500).send("Internal server error");
    }
});

// Get a specific encounter by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const encounterId = req.params.id;
        const userId = req.userId;

        // Get the encounter
        const encounter = await encounterDAO.getEncounterById(encounterId);

        // Make sure encounter exists
        if (!encounter) {
            return res.status(404).send("Encounter not found.");
        }

        // Get the user
        const user = await userDAO.getUserById(userId);

        // Make sure the user is the owner of the encounter or has admin role
        if (encounter.userId.toString() !== userId && !user.roles.includes("admin")) {
            return res.status(404).send("Unauthorized request.");
        }

        // Return the encounter
        res.status(200).json(encounter);
    } catch (error) {
        console.error('Error fetching encounter: ', error);
        res.status(500).send("Internal server error");
    }
});

// Get all encounters
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await userDAO.getUserById(req.userId);

        if (user.roles.includes("admin")) { //admins get all encounters
            const encounters = await encounterDAO.getAllEncounters();
            res.status(200).json(encounters);
        } else {
            const encounters = await encounterDAO.getAllEncountersForUserId(req.userId);
            res.status(200).json(encounters);
        }
    } catch (error) {
        console.error("Could not retrieve encounters: ", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
