const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// Trip stops table stores each stop in order.
const TripStop = sequelize.define(
  "TripStop",
  {
    stopId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    stopOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stopName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "trip_stops",
    timestamps: false
  }
);

module.exports = TripStop;
