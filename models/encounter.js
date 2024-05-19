const mongoose = require("mongoose");

const encounterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  combatants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "combatants" }],
    required: true,
  },
});

module.exports = mongoose.model("encounters", encounterSchema);