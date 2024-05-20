const mongoose = require("mongoose");

const combatantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initiative: { type: Number, required: true },
  hitpoints: { type: Number, required: true }
});

module.exports = mongoose.model("combatants", combatantSchema);