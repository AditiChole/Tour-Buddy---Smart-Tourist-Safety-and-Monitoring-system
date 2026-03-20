const toRadians = (value) => (value * Math.PI) / 180;

// This finds the distance between two locations in meters.
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  // Radius of earth in meters.
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

module.exports = { haversineDistance };
