const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// This table stores which volunteer is assigned to which case.
const VolunteerAssignment = sequelize.define(
  "VolunteerAssignment",
  {
    assignmentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    volunteerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    alertId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM("ASSIGNED", "ACCEPTED", "REJECTED", "RESOLVED"),
      defaultValue: "ASSIGNED"
    }
  },
  {
    tableName: "volunteer_assignments",
    timestamps: false
  }
);

module.exports = VolunteerAssignment;
