const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// This table stores safe, caution, and unsafe zones.
const GeofenceZone = sequelize.define(
  "GeofenceZone",
  {
    zoneId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    zoneType: {
      type: DataTypes.ENUM("SAFE", "CAUTION", "UNSAFE"),
      allowNull: false
    },
    centerLatitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    centerLongitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    radiusInMeters: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "geofence_zones",
    timestamps: true
  }
);

module.exports = GeofenceZone;
