const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// Volunteer table stores volunteer details.
const Volunteer = sequelize.define(
  "Volunteer",
  {
    volunteerId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    availabilityStatus: {
      type: DataTypes.ENUM("AVAILABLE", "BUSY", "OFFLINE"),
      defaultValue: "AVAILABLE"
    },
    assignedZone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    currentLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  },
  {
    tableName: "volunteers",
    timestamps: true
  }
);

module.exports = Volunteer;
