const Encounter = require('../models/encounter');
const userDao = require('./user');

module.exports = {};

module.exports.createEncounter = async (userId, name, combatants) => {
    const newEncounter = new Encounter({
        userId: userId,
        name: name,
        combatants: combatants
    });
    try {
        const savedEncounter = await newEncounter.save();
        return savedEncounter;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


module.exports.getAllEncounters = async () => {
    try {
        const foundEncounters = await Encounter.find().lean();
        return foundEncounters || [];
    } catch (error) {
        console.error('Could not retrieve encounters:', error);
        throw error; // Throw the error for handling in the caller function
    }
}

module.exports.getAllEncountersForUserId = async (userId) => {
    try {
        const foundEncounters = await Encounter.find({ userId: userId }).lean();
        return foundEncounters || null;
    } catch (error) {
        console.error('Could not retrieve encounters:', error);
        throw error; // Throw the error for handling in the caller function
    }
};


module.exports.getEncounterById = async (id) => {
    const foundEncounter = await Encounter.findOne({ _id: id }).populate('combatants').lean();
    return foundEncounter || null;
}

module.exports.getUserForEncounter = async (id) => {
    try {
        // get the encounter
        const encounter = await Encounter.findOne({ _id: id }).lean();

        //check if encounter exists
        if (!encounter) {
            return null;
        }

        // Fetch the user associated with the encounter
        const user = await userDao.getUserById(encounter.userId);

        return user;
    } catch (error) {
        console.error('Error fetching user for encounter: ', error);
        throw error;
    }
}

module.exports.updateEncounterById = async (id, combatants) => {
    try {
        const encounter = await Encounter.findOne({ _id: id });

        if (!encounter) {
            throw new Error("Encounter not found!");
        }

        // update the encounter
        encounter.combatants = combatants;

        // save the item
        const updatedEncounter = await encounter.save();

        return updatedEncounter;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

module.exports.searchEncountersByUserIdAndName = async (userId, name) => {
    try {
        // Perform case-insensitive search using regex, and filter by user ID
        const encounters = await Encounter.find({ userId, name: { $regex: new RegExp(name, "i") } });
        console.log("encounters DAO", encounters);
        return encounters;
    } catch (error) {
        console.error("Error searching encounters:", error);
        throw new Error("An error occurred while searching encounters");
    }
}