const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// Trip table stores journey plan details.
const Trip = sequelize.define(
  "Trip",
  {
    tripId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    currentStatus: {
      type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PLANNED"
    },
    geoFenceEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "trips",
    timestamps: true
  }
);

module.exports = Trip;
