const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// This table stores digital tourist ID details.
const DigitalTouristId = sequelize.define(
  "DigitalTouristId",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    idCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    qrValue: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verifiedStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    issuedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "digital_tourist_ids",
    timestamps: false
  }
);

module.exports = DigitalTouristId;
