const Combatant = require('../models/combatant');
const Encounter = require('../models/encounter');

module.exports = {};

// Function to check if a combatant is in use by any encounter
const isCombatantInUse = async (combatantId) => {
    const encounter = await Encounter.findOne({ combatants: combatantId });
    return !!encounter; // Returns true if combatant is found in any encounter
};

module.exports.createCombatant = async (name, initiative, hitpoints) => {
    const newCombatant = new Combatant({
        name: name,
        initiative: initiative,
        hitpoints: hitpoints
    });
    try {
        const savedCombatant = await newCombatant.save();
        return savedCombatant;
    } catch (error) {
        console.error("Error creating combatant:", error);
        throw error;
    }
}

module.exports.updateCombatantById = async (id, name, initiative, hitpoints) => {
    try {
        const combatant = await Combatant.findOne({ _id: id });
        
        if (!combatant) {
            throw new Error("Combatant not found!");
        }

        // Update the combatant
        combatant.name = name;
        combatant.initiative = initiative;
        combatant.hitpoints = hitpoints;

        // Save the combatant
        const updatedCombatant = await combatant.save();
        return updatedCombatant;
    } catch (error) {
        console.error("Error updating combatant:", error);
        throw error;
    }
}


module.exports.deleteCombatantById = async (id) => {
    try {
        const combatant = await Combatant.findById(id);

        if (!combatant) {
            throw new Error("Combatant not found!");
        }

        // Check if the combatant is in use by any encounter
        const inUse = await isCombatantInUse(id);

        if (inUse) {
            throw new Error("Cannot delete combatant as it is still in use by an encounter.");
        }

        await Combatant.deleteOne({ _id: id });

        return { message: "Combatant deleted successfully" };
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports.getAllCombatants = async () => {
    try {
        const foundCombatants = await Combatant.find().lean();
        return foundCombatants || [];
    } catch (error) {
        console.error("Error retrieving all combatants:", error);
        throw error;
    }
}

module.exports.getCombatantsById = async (id) => {
    try {
        const foundCombatant = await Combatant.findOne({ _id: id }).lean();
        return foundCombatant || null;
    } catch (error) {
        console.error("Error retrieving combatant by ID:", error);
        throw error;
    }
}
