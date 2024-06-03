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
  name: {
    type: String
  }
});

encounterSchema.index({ userId: 1, name: 1 });
encounterSchema.index({ combatants: 1 });

module.exports = mongoose.model("encounters", encounterSchema);