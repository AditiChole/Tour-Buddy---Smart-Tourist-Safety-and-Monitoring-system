require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/mongo");
const sequelize = require("./config/postgres");
require("./models/postgres");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect PostgreSQL
    await sequelize.authenticate();
    await sequelize.sync();

    // Connect MongoDB
    await connectMongo();

    // Start backend server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
