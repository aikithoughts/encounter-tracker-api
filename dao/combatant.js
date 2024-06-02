const Combatant = require('../models/combatant');

module.exports = {};

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

        await Combatant.deleteOne({ _id: id });

        return { message: "Combatant deleted successfully" };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

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
