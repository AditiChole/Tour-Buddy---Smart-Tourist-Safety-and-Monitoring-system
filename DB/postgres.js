const { Sequelize } = require("sequelize");
const env = require("./env");

// PostgreSQL is used for main app data like users, trips, and volunteers.
const sequelize = new Sequelize(
  env.postgres.database,
  env.postgres.username,
  env.postgres.password,
  {
    host: env.postgres.host,
    port: env.postgres.port,
    dialect: "postgres",
    logging: false
  }
);

module.exports = sequelize;
