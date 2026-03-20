const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

// User table stores login and profile details.
const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user", "volunteer", "admin"),
      allowNull: false,
      defaultValue: "user"
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    touristIdCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: "users",
    timestamps: true
  }
);

module.exports = User;
