const User = require("./user.model");
const Trip = require("./trip.model");
const TripStop = require("./tripStop.model");
const Volunteer = require("./volunteer.model");
const VolunteerAssignment = require("./volunteerAssignment.model");
const GeofenceZone = require("./geofenceZone.model");
const DigitalTouristId = require("./digitalTouristId.model");

// These relations connect users, trips, stops, zones, and volunteers.
User.hasMany(Trip, { foreignKey: "userId", as: "trips" });
Trip.belongsTo(User, { foreignKey: "userId", as: "user" });

Trip.hasMany(TripStop, { foreignKey: "tripId", as: "stops", onDelete: "CASCADE" });
TripStop.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

User.hasOne(DigitalTouristId, { foreignKey: "userId", as: "digitalId" });
DigitalTouristId.belongsTo(User, { foreignKey: "userId", as: "user" });

Volunteer.hasMany(VolunteerAssignment, { foreignKey: "volunteerId", as: "assignments" });
VolunteerAssignment.belongsTo(Volunteer, { foreignKey: "volunteerId", as: "volunteer" });

User.hasMany(VolunteerAssignment, { foreignKey: "userId", as: "volunteerSupportRequests" });
VolunteerAssignment.belongsTo(User, { foreignKey: "userId", as: "requestUser" });

User.hasMany(GeofenceZone, { foreignKey: "userId", as: "zones" });
GeofenceZone.belongsTo(User, { foreignKey: "userId", as: "zoneUser" });

Trip.hasMany(GeofenceZone, { foreignKey: "tripId", as: "zones" });
GeofenceZone.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

module.exports = {
  User,
  Trip,
  TripStop,
  Volunteer,
  VolunteerAssignment,
  GeofenceZone,
  DigitalTouristId
};
