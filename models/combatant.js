const mongoose = require("mongoose");

const combatantSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("combatants", combatantSchema);