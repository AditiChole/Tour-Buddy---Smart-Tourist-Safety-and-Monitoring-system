const mongoose = require("mongoose");
const env = require("./env");

// MongoDB is used for alerts, logs, and location history.
const connectMongo = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectMongo;
