const mongoose = require("mongoose");
const models = [
  require("./models/item"),
  require("./models/order"),
  require("./models/user"),
  require("./models/combatant"),
  require("./models/encounter")
];

module.exports = {};

module.exports.connectDB = async () => {
//  await mongoose.connect(process.env.MONGO_URL, {});
  await mongoose.connect("mongodb://127.0.0.1/encountertracker", {});
  await Promise.all(models.map((m) => m.syncIndexes()));
};

module.exports.stopDB = async () => {
  await mongoose.disconnect();
};

module.exports.clearDB = async () => {
  await Promise.all(models.map((model) => model.deleteMany()));
};

module.exports.findOne = async (model, query) => {
  const result = await model.findOne(query).lean();
  if (result) {
    result._id = result._id.toString();
  }
  return result;
};

module.exports.find = async (model, query) => {
  const results = await model.find(query).lean();
  results.forEach((result) => {
    result._id = result._id.toString();
  });
  return results;
};
