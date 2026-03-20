const { Trip, TripStop } = require("../models/postgres");

// Convert stops into ordered stop data.
const mapStopsPayload = (stops = []) =>
  stops.map((stop, index) => ({
    stopName: stop.stopName || stop,
    stopOrder: stop.stopOrder || index + 1
  }));

const createTrip = async (userId, payload) => {
  // Create the trip first, then save its stops.
  const trip = await Trip.create({
    userId,
    title: payload.title,
    source: payload.source,
    destination: payload.destination,
    startDate: payload.startDate,
    endDate: payload.endDate,
    geoFenceEnabled: payload.geoFenceEnabled ?? true
  });

  if (payload.stops?.length) {
    const stops = mapStopsPayload(payload.stops).map((stop) => ({
      ...stop,
      tripId: trip.tripId
    }));
    await TripStop.bulkCreate(stops);
  }

  return Trip.findByPk(trip.tripId, { include: [{ model: TripStop, as: "stops" }] });
};

const getTrips = async (userId) =>
  Trip.findAll({
    where: { userId },
    include: [{ model: TripStop, as: "stops" }],
    order: [["createdAt", "DESC"]]
  });

const getTripById = async (tripId, userId) => {
  // Make sure the trip belongs to the logged-in user.
  const trip = await Trip.findOne({
    where: { tripId, userId },
    include: [{ model: TripStop, as: "stops" }]
  });

  if (!trip) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  return trip;
};

const updateTrip = async (tripId, userId, payload) => {
  // Replace old stops with the new stop list.
  const trip = await getTripById(tripId, userId);

  ["title", "source", "destination", "startDate", "endDate", "geoFenceEnabled", "currentStatus"].forEach((field) => {
    if (payload[field] !== undefined) {
      trip[field] = payload[field];
    }
  });

  await trip.save();

  if (payload.stops) {
    await TripStop.destroy({ where: { tripId: trip.tripId } });
    const stops = mapStopsPayload(payload.stops).map((stop) => ({
      ...stop,
      tripId: trip.tripId
    }));
    await TripStop.bulkCreate(stops);
  }

  return getTripById(tripId, userId);
};

const deleteTrip = async (tripId, userId) => {
  const trip = await getTripById(tripId, userId);
  await trip.destroy();
  return { deleted: true };
};

const startTrip = async (tripId, userId) => {
  // Mark this trip as active.
  const trip = await getTripById(tripId, userId);
  trip.currentStatus = "ACTIVE";
  await trip.save();
  return trip;
};

const completeTrip = async (tripId, userId) => {
  // Mark this trip as completed.
  const trip = await getTripById(tripId, userId);
  trip.currentStatus = "COMPLETED";
  await trip.save();
  return trip;
};

const getActiveTrip = async (userId) =>
  Trip.findOne({
    where: { userId, currentStatus: "ACTIVE" },
    include: [{ model: TripStop, as: "stops" }],
    order: [["updatedAt", "DESC"]]
  });

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  startTrip,
  completeTrip,
  getActiveTrip
};
