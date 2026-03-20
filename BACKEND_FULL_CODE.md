# Women Safety Smart Travel App Backend - Full Code

This file contains the complete backend module code in one place.


## File: "package.json"

```
{
  "name": "women-safety-smart-travel-backend",
  "version": "1.0.0",
  "description": "Backend and database system for Women Safety Smart Travel App",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "keywords": [
    "express",
    "postgresql",
    "mongodb",
    "jwt",
    "women-safety",
    "travel-app"
  ],
  "author": "Member 3 - Backend & Database Engineer",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "express-validator": "^7.1.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1",
    "pg": "^8.12.0",
    "sequelize": "^6.37.3",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```



## File: ".env.example"

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace_with_super_secure_secret
JWT_EXPIRES_IN=7d
POSTGRES_DB=women_safety_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
MONGO_URI=mongodb://127.0.0.1:27017/women_safety_app
```



## File: "BACKEND_HANDOFF.md"

```
# Backend Handoff

This is Member 3's backend and database module for the Women Safety Smart Travel App.

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- MongoDB
- JWT Authentication

## What Is Included
- Authentication and authorization
- User and profile APIs
- Dashboard APIs
- Trip and itinerary APIs
- Live tracking APIs
- Geo-fence engine
- SOS emergency APIs
- Volunteer APIs
- PostgreSQL models
- MongoDB models
- Middleware and validators
- API docs

## Main Files
- `package.json`
- `.env.example`
- `src/app.js`
- `src/server.js`

## Folder Structure
```text
src/
  config/
  controllers/
  middleware/
  models/
    postgres/
    mongo/
  routes/
  services/
  utils/
  validators/
  docs/
  app.js
  server.js
```

## Setup Steps
1. Install Node.js
2. Install PostgreSQL
3. Install MongoDB
4. Copy `.env.example` to `.env`
5. Fill database values in `.env`
6. Run:

```bash
npm install
npm run dev
```

## Environment File
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
POSTGRES_DB=women_safety_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
MONGO_URI=mongodb://127.0.0.1:27017/women_safety_app
```

## Important Docs
- `src/docs/api-docs.md`
- `src/docs/database-schema.md`

## Important Note
This backend is a single modular Express app. It is made simple and easy to explain in viva.
```



## File: "src\app.js"

```
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const apiLimiter = require("./middleware/rateLimit.middleware");
const { notFoundHandler } = require("./middleware/notFound.middleware");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Women Safety Smart Travel backend is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```



## File: "src\config\env.js"

```
// This file reads all environment variables in one place.
const envConfig = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "*",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  postgres: {
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432
  },
  mongoUri: process.env.MONGO_URI
};

module.exports = envConfig;
```



## File: "src\config\mongo.js"

```
const mongoose = require("mongoose");
const env = require("./env");

// MongoDB is used for alerts, logs, and location history.
const connectMongo = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectMongo;
```



## File: "src\config\postgres.js"

```
const { Sequelize } = require("sequelize");
const env = require("./env");

// PostgreSQL is used for main app data like users, trips, and volunteers.
const sequelize = new Sequelize(
  env.postgres.database,
  env.postgres.username,
  env.postgres.password,
  {
    host: env.postgres.host,
    port: env.postgres.port,
    dialect: "postgres",
    logging: false
  }
);

module.exports = sequelize;
```



## File: "src\controllers\auth.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const authService = require("../services/auth.service");

// This controller handles auth requests and returns responses.
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendResponse(res, 201, true, "User registered successfully", result);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendResponse(res, 200, true, "Login successful", result);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);
  return sendResponse(res, 200, true, "Current user fetched successfully", user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateCurrentUserProfile(req.user.userId, req.body);
  return sendResponse(res, 200, true, "Profile updated successfully", user);
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteCurrentUser(req.user.userId);
  return sendResponse(res, 200, true, "Account deleted successfully", result);
});
```



## File: "src\controllers\dashboard.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

// This controller handles dashboard APIs.
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.user.userId);
  return sendResponse(res, 200, true, "Dashboard summary fetched successfully", summary);
});

exports.getRecentAlerts = asyncHandler(async (req, res) => {
  const alerts = await dashboardService.getRecentAlerts(req.user.userId);
  return sendResponse(res, 200, true, "Recent alerts fetched successfully", alerts);
});

exports.startTrip = asyncHandler(async (req, res) => {
  const trip = await dashboardService.startTripFromDashboard(req.user.userId, req.body.tripId);
  return sendResponse(res, 200, true, "Trip started successfully", trip);
});

exports.shareLocation = asyncHandler(async (req, res) => {
  const result = await dashboardService.shareLocationFromDashboard({
    userId: req.user.userId,
    ...req.body
  });
  return sendResponse(res, 200, true, "Location shared successfully", result);
});
```



## File: "src\controllers\geofence.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const geofenceService = require("../services/geofence.service");

// This controller handles zone create, update, and check APIs.
exports.createZone = asyncHandler(async (req, res) => {
  const zone = await geofenceService.createZone(req.body);
  return sendResponse(res, 201, true, "Zone created successfully", zone);
});

exports.getZones = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.tripId) filters.tripId = req.query.tripId;
  const zones = await geofenceService.getZones(filters);
  return sendResponse(res, 200, true, "Zones fetched successfully", zones);
});

exports.getZoneById = asyncHandler(async (req, res) => {
  const zone = await geofenceService.getZoneById(req.params.id);
  return sendResponse(res, 200, true, "Zone fetched successfully", zone);
});

exports.updateZone = asyncHandler(async (req, res) => {
  const zone = await geofenceService.updateZone(req.params.id, req.body);
  return sendResponse(res, 200, true, "Zone updated successfully", zone);
});

exports.deleteZone = asyncHandler(async (req, res) => {
  const result = await geofenceService.deleteZone(req.params.id);
  return sendResponse(res, 200, true, "Zone deleted successfully", result);
});

exports.checkZone = asyncHandler(async (req, res) => {
  const result = await geofenceService.resolveZoneStatus({
    ...req.body,
    userId: req.body.userId || req.user.userId,
    createUnsafeAlert: true
  });
  return sendResponse(res, 200, true, "Geofence check completed successfully", result);
});
```



## File: "src\controllers\location.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const locationService = require("../services/location.service");

// This controller handles live tracking APIs.
exports.updateLocation = asyncHandler(async (req, res) => {
  const result = await locationService.createLocationUpdate({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 201, true, "Location updated successfully", result);
});

exports.getCurrentLocation = asyncHandler(async (req, res) => {
  const location = await locationService.getCurrentLocation(req.params.userId);
  return sendResponse(res, 200, true, "Current location fetched successfully", location);
});

exports.getLocationHistory = asyncHandler(async (req, res) => {
  const history = await locationService.getLocationHistory(req.params.userId);
  return sendResponse(res, 200, true, "Location history fetched successfully", history);
});

exports.checkZone = asyncHandler(async (req, res) => {
  const zoneResult = await locationService.checkLocationZone({
    ...req.body,
    userId: req.body.userId || req.user.userId
  });
  return sendResponse(res, 200, true, "Zone status checked successfully", zoneResult);
});

exports.getZoneStatus = asyncHandler(async (req, res) => {
  const zoneStatus = await locationService.getZoneStatusForUser(req.params.userId);
  return sendResponse(res, 200, true, "Zone status fetched successfully", zoneStatus);
});
```



## File: "src\controllers\profile.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const profileService = require("../services/profile.service");

// This controller handles profile screen APIs.
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.userId);
  return sendResponse(res, 200, true, "Profile fetched successfully", profile);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.userId, req.body);
  return sendResponse(res, 200, true, "Profile updated successfully", profile);
});

exports.getDigitalId = asyncHandler(async (req, res) => {
  const digitalId = await profileService.getDigitalId(req.user.userId);
  return sendResponse(res, 200, true, "Digital tourist ID fetched successfully", digitalId);
});

exports.getTripHistory = asyncHandler(async (req, res) => {
  const tripHistory = await profileService.getTripHistory(req.user.userId);
  return sendResponse(res, 200, true, "Trip history fetched successfully", tripHistory);
});

exports.getPersonalDetails = asyncHandler(async (req, res) => {
  const details = await profileService.getPersonalDetails(req.user.userId);
  return sendResponse(res, 200, true, "Personal details fetched successfully", details);
});
```



## File: "src\controllers\sos.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const sosService = require("../services/sos.service");

// This controller handles SOS emergency APIs.
exports.triggerSOS = asyncHandler(async (req, res) => {
  const alert = await sosService.triggerSOS({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 201, true, "SOS alert triggered successfully", alert);
});

exports.shareLocation = asyncHandler(async (req, res) => {
  const result = await sosService.shareSOSLocation({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 200, true, "SOS location shared successfully", result);
});

exports.notifyVolunteers = asyncHandler(async (req, res) => {
  const assignments = await sosService.notifyVolunteers({
    ...req.body,
    userId: req.user.userId,
    assignedBy: req.user.userId
  });
  return sendResponse(res, 200, true, "Volunteers notified successfully", assignments);
});

exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await sosService.getAlerts(req.query.userId ? { userId: req.query.userId } : {});
  return sendResponse(res, 200, true, "Alerts fetched successfully", alerts);
});

exports.getAlertById = asyncHandler(async (req, res) => {
  const alert = await sosService.getAlertById(req.params.id);
  return sendResponse(res, 200, true, "Alert fetched successfully", alert);
});

exports.updateAlertStatus = asyncHandler(async (req, res) => {
  const alert = await sosService.updateAlertStatus(req.params.id, req.body.status);
  return sendResponse(res, 200, true, "Alert status updated successfully", alert);
});
```



## File: "src\controllers\trip.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const tripService = require("../services/trip.service");

// This controller handles trip and itinerary APIs.
exports.createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.user.userId, req.body);
  return sendResponse(res, 201, true, "Trip created successfully", trip);
});

exports.getTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getTrips(req.user.userId);
  return sendResponse(res, 200, true, "Trips fetched successfully", trips);
});

exports.getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip details fetched successfully", trip);
});

exports.updateTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.user.userId, req.body);
  return sendResponse(res, 200, true, "Trip updated successfully", trip);
});

exports.deleteTrip = asyncHandler(async (req, res) => {
  const result = await tripService.deleteTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip deleted successfully", result);
});

exports.startTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.startTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip started successfully", trip);
});

exports.completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.completeTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip completed successfully", trip);
});
```



## File: "src\controllers\user.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const authService = require("../services/auth.service");

// This controller is for admin user management.
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await authService.getAllUsers();
  return sendResponse(res, 200, true, "Users fetched successfully", users);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const user = await authService.updateUserRole(req.params.id, req.body.role);
  return sendResponse(res, 200, true, "User role updated successfully", user);
});
```



## File: "src\controllers\volunteer.controller.js"

```
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const volunteerService = require("../services/volunteer.service");

// This controller handles volunteer and assignment APIs.
exports.createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.createVolunteer(req.body);
  return sendResponse(res, 201, true, "Volunteer created successfully", volunteer);
});

exports.getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.getVolunteers();
  return sendResponse(res, 200, true, "Volunteers fetched successfully", volunteers);
});

exports.getVolunteerById = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getVolunteerById(req.params.id);
  return sendResponse(res, 200, true, "Volunteer fetched successfully", volunteer);
});

exports.updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.updateVolunteer(req.params.id, req.body);
  return sendResponse(res, 200, true, "Volunteer updated successfully", volunteer);
});

exports.assignVolunteer = asyncHandler(async (req, res) => {
  const assignment = await volunteerService.assignVolunteer({
    ...req.body,
    assignedBy: req.user.userId
  });
  return sendResponse(res, 201, true, "Volunteer assigned successfully", assignment);
});

exports.getAssignments = asyncHandler(async (req, res) => {
  const assignments = await volunteerService.getAssignments();
  return sendResponse(res, 200, true, "Volunteer assignments fetched successfully", assignments);
});

exports.updateAssignmentStatus = asyncHandler(async (req, res) => {
  const assignment = await volunteerService.updateAssignmentStatus(req.params.id, req.body.status);
  return sendResponse(res, 200, true, "Assignment status updated successfully", assignment);
});
```



## File: "src\docs\api-docs.md"

```
# Women Safety Smart Travel App Backend API Docs

## Tech Stack
- Node.js
- Express.js
- PostgreSQL with Sequelize
- MongoDB with Mongoose
- JWT Authentication

## Database Design

### PostgreSQL Tables
- `users`: profile, authentication, roles, verification
- `trips`: itinerary master records
- `trip_stops`: ordered trip stops
- `volunteers`: volunteer profile and availability
- `volunteer_assignments`: emergency assignment tracking
- `geofence_zones`: safe, caution, unsafe zones
- `digital_tourist_ids`: digital ID metadata

### MongoDB Collections
- `alerts`: SOS and geo-fence alerts
- `location_logs`: high-frequency live locations
- `geofence_events`: zone entry logs
- `notification_logs`: notification audit trail
- `activity_logs`: user activity trail

## Why Each Database Is Used
- PostgreSQL stores structured and relational data that needs joins, constraints, and clear ownership.
- MongoDB stores flexible, high-write, event-based data such as alerts, logs, and location history.

## Auth Header
`Authorization: Bearer <token>`

## Module-wise Endpoint List

### Authentication
- `POST /api/auth/register` - Register user - Public
- `POST /api/auth/login` - Login user - Public
- `GET /api/auth/me` - Current user - Protected
- `PUT /api/auth/update-profile` - Update own profile - Protected
- `DELETE /api/auth/delete-account` - Delete own account - Protected

### Users
- `GET /api/users` - Get all users - Admin
- `PUT /api/users/:id/role` - Change user role - Admin

### Dashboard
- `GET /api/dashboard/summary` - Home summary - Protected
- `GET /api/dashboard/recent-alerts` - Recent alerts - Protected
- `POST /api/dashboard/start-trip` - Start a trip - Protected
- `POST /api/dashboard/share-location` - Quick location share - Protected

### Trips / Itinerary
- `POST /api/trips` - Create trip - Protected
- `GET /api/trips` - Get trips - Protected
- `GET /api/trips/:id` - Trip details - Protected
- `PUT /api/trips/:id` - Update trip - Protected
- `DELETE /api/trips/:id` - Delete trip - Protected
- `PATCH /api/trips/:id/start` - Mark trip active - Protected
- `PATCH /api/trips/:id/complete` - Mark trip completed - Protected

### Profile
- `GET /api/profile` - Profile screen data - Protected
- `PUT /api/profile` - Update profile - Protected
- `GET /api/profile/digital-id` - Tourist ID - Protected
- `GET /api/profile/trip-history` - Trip history - Protected
- `GET /api/profile/personal-details` - Personal details - Protected

### Live Tracking
- `POST /api/location/update` - Save current location - Protected
- `GET /api/location/current/:userId` - Latest location - Protected
- `GET /api/location/history/:userId` - Location history - Protected
- `POST /api/location/check-zone` - Check zone - Protected
- `GET /api/location/zone-status/:userId` - Current zone status - Protected

### Geo-fence
- `POST /api/geofence/zones` - Create zone - Admin or Volunteer
- `GET /api/geofence/zones` - List zones - Protected
- `GET /api/geofence/zones/:id` - Zone details - Protected
- `PUT /api/geofence/zones/:id` - Update zone - Admin or Volunteer
- `DELETE /api/geofence/zones/:id` - Delete zone - Admin
- `POST /api/geofence/check` - Check coordinates against zones - Protected

### SOS
- `POST /api/sos/trigger` - Trigger SOS alert - Protected
- `POST /api/sos/share-location` - Share emergency location - Protected
- `POST /api/sos/notify-volunteers` - Notify volunteers - Protected
- `GET /api/sos/alerts` - List alerts - Protected
- `GET /api/sos/alerts/:id` - Alert details - Protected
- `PUT /api/sos/alerts/:id/status` - Update alert status - Protected

### Volunteer
- `POST /api/volunteers` - Create volunteer profile - Admin
- `GET /api/volunteers` - Get volunteers - Admin or Volunteer
- `GET /api/volunteers/:id` - Volunteer details - Admin or Volunteer
- `PUT /api/volunteers/:id` - Update volunteer - Admin
- `POST /api/volunteers/assign` - Assign volunteer - Admin or Volunteer
- `GET /api/volunteers/assignments` - List assignments - Admin or Volunteer
- `PUT /api/volunteers/assignments/:id/status` - Update assignment status - Admin or Volunteer

## Sample Request

### Register
```json
{
  "fullName": "Aditi Sharma",
  "email": "aditi@example.com",
  "password": "secret123",
  "phone": "9876543210",
  "emergencyContact": "9123456780",
  "role": "user"
}
```

### Trip Create
```json
{
  "title": "Nagpur to Sevagram",
  "source": "Nagpur",
  "destination": "Sevagram",
  "startDate": "2026-03-20",
  "endDate": "2026-03-22",
  "stops": [
    { "stopName": "College", "stopOrder": 1 },
    { "stopName": "Market", "stopOrder": 2 },
    { "stopName": "Hotel", "stopOrder": 3 }
  ],
  "geoFenceEnabled": true
}
```

### Geofence Check Response
```json
{
  "success": true,
  "message": "Geofence check completed successfully",
  "data": {
    "zoneStatus": "UNSAFE",
    "matchedZone": {
      "zoneId": "uuid"
    },
    "distanceInMeters": 210.55,
    "alertTriggered": true
  }
}
```

## Screen to Endpoint Mapping
- Dashboard UI: `/api/dashboard/summary`, `/api/dashboard/recent-alerts`, `/api/dashboard/start-trip`, `/api/dashboard/share-location`
- Live Tracking UI: `/api/location/update`, `/api/location/check-zone`, `/api/location/zone-status/:userId`
- SOS UI: `/api/sos/trigger`, `/api/sos/notify-volunteers`, `/api/sos/share-location`
- Itinerary UI: `/api/trips`, `/api/trips/:id`, `/api/trips/:id/start`, `/api/trips/:id/complete`
- Profile UI: `/api/profile`, `/api/profile/digital-id`, `/api/profile/trip-history`, `/api/profile/personal-details`

## Postman Testing Flow
1. Register with `/api/auth/register`
2. Login with `/api/auth/login`
3. Add Bearer token in headers
4. Create trip with `/api/trips`
5. Create geofence zone with `/api/geofence/zones`
6. Update location with `/api/location/update`
7. Check generated alert in `/api/sos/alerts`
8. Trigger manual SOS with `/api/sos/trigger`
9. Create volunteer and assignment
10. Load dashboard summary
```



## File: "src\docs\database-schema.md"

```
# Database Schema Notes

## PostgreSQL Schema

### `users`
- `userId` UUID primary key
- `fullName` VARCHAR not null
- `email` VARCHAR unique not null
- `password` VARCHAR not null
- `phone` VARCHAR not null
- `emergencyContact` VARCHAR not null
- `role` ENUM(`user`, `volunteer`, `admin`)
- `profilePhoto` VARCHAR nullable
- `touristIdCode` VARCHAR unique nullable
- `isVerified` BOOLEAN default false
- `createdAt`, `updatedAt`

### `trips`
- `tripId` UUID primary key
- `userId` UUID foreign key
- `title` VARCHAR not null
- `source` VARCHAR not null
- `destination` VARCHAR not null
- `startDate` DATE not null
- `endDate` DATE not null
- `currentStatus` ENUM(`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
- `geoFenceEnabled` BOOLEAN default true
- `createdAt`, `updatedAt`

### `trip_stops`
- `stopId` UUID primary key
- `tripId` UUID foreign key
- `stopOrder` INTEGER not null
- `stopName` VARCHAR not null

### `volunteers`
- `volunteerId` UUID primary key
- `userId` UUID nullable
- `fullName` VARCHAR not null
- `phone` VARCHAR not null
- `availabilityStatus` ENUM(`AVAILABLE`, `BUSY`, `OFFLINE`)
- `assignedZone` VARCHAR nullable
- `currentLatitude` FLOAT nullable
- `currentLongitude` FLOAT nullable
- `createdAt`, `updatedAt`

### `volunteer_assignments`
- `assignmentId` UUID primary key
- `volunteerId` UUID foreign key
- `userId` UUID foreign key
- `tripId` UUID nullable
- `alertId` VARCHAR nullable
- `assignedBy` UUID nullable
- `assignedAt` DATETIME
- `status` ENUM(`ASSIGNED`, `ACCEPTED`, `REJECTED`, `RESOLVED`)

### `geofence_zones`
- `zoneId` UUID primary key
- `tripId` UUID nullable
- `userId` UUID nullable
- `zoneType` ENUM(`SAFE`, `CAUTION`, `UNSAFE`)
- `centerLatitude` FLOAT not null
- `centerLongitude` FLOAT not null
- `radiusInMeters` FLOAT not null
- `isActive` BOOLEAN default true
- `createdAt`, `updatedAt`

### `digital_tourist_ids`
- `id` UUID primary key
- `userId` UUID unique foreign key
- `idCode` VARCHAR unique not null
- `qrValue` TEXT not null
- `verifiedStatus` BOOLEAN default false
- `issuedAt` DATETIME

## MongoDB Collections

### `alerts`
- `alertId`
- `userId`
- `tripId`
- `alertType`
- `message`
- `latitude`
- `longitude`
- `severity`
- `status`
- `volunteersNotified`
- timestamps

### `location_logs`
- `logId`
- `userId`
- `latitude`
- `longitude`
- `timestamp`
- `zoneStatus`
- `tripId`

### `geofence_events`
- `eventId`
- `userId`
- `tripId`
- `zoneId`
- `zoneType`
- `latitude`
- `longitude`
- `message`

### `notification_logs`
- `notificationId`
- `type`
- `recipientType`
- `recipientId`
- `message`
- `metadata`

### `activity_logs`
- `activityId`
- `userId`
- `action`
- `details`

## Why This Split Works
- PostgreSQL is better for structured data with relationships, role logic, trip history, and assignment tracking.
- MongoDB is better for append-heavy alert logs, live location history, and event-driven records that grow quickly.
```



## File: "src\middleware\auth.middleware.js"

```
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models/postgres");

// Check token and attach logged-in user data.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token user"
      });
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      errors: [error.message]
    });
  }
};

module.exports = { protect };
```



## File: "src\middleware\error.middleware.js"

```
// This handles all errors in one place.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errors: process.env.NODE_ENV === "development" ? [err.stack] : null
  });
};

module.exports = { errorHandler };
```



## File: "src\middleware\notFound.middleware.js"

```
// This runs when the route does not exist.
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

module.exports = { notFoundHandler };
```



## File: "src\middleware\rateLimit.middleware.js"

```
const rateLimit = require("express-rate-limit");

// This limits too many requests in a short time.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

module.exports = apiLimiter;
```



## File: "src\middleware\role.middleware.js"

```
// Allow only selected roles to use this route.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to access this resource"
    });
  }

  next();
};

module.exports = { authorize };
```



## File: "src\middleware\validate.middleware.js"

```
const { validationResult } = require("express-validator");

// This sends validation errors in simple JSON format.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
};

module.exports = validate;
```



## File: "src\models\mongo\activityLog.model.js"

```
const mongoose = require("mongoose");

// This collection stores user activity logs.
const activityLogSchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    collection: "activity_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
```



## File: "src\models\mongo\alert.model.js"

```
const mongoose = require("mongoose");

// This collection stores emergency and geo-fence alerts.
const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    tripId: {
      type: String,
      default: null
    },
    alertType: {
      type: String,
      enum: ["SOS", "GEO_FENCE", "MANUAL", "EMERGENCY"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH"
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN"
    },
    volunteersNotified: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: "alerts",
    timestamps: true
  }
);

module.exports = mongoose.model("Alert", alertSchema);
```



## File: "src\models\mongo\geofenceEvent.model.js"

```
const mongoose = require("mongoose");

// This collection stores zone entry events.
const geofenceEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    tripId: {
      type: String,
      default: null
    },
    zoneId: {
      type: String,
      default: null
    },
    zoneType: {
      type: String,
      enum: ["SAFE", "CAUTION", "UNSAFE", "OUTSIDE"],
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    collection: "geofence_events",
    timestamps: true
  }
);

module.exports = mongoose.model("GeofenceEvent", geofenceEventSchema);
```



## File: "src\models\mongo\locationLog.model.js"

```
const mongoose = require("mongoose");

// This collection stores live location updates.
const locationLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    zoneStatus: {
      type: String,
      enum: ["SAFE", "CAUTION", "UNSAFE", "OUTSIDE"],
      default: "OUTSIDE"
    },
    tripId: {
      type: String,
      default: null
    }
  },
  {
    collection: "location_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("LocationLog", locationLogSchema);
```



## File: "src\models\mongo\notificationLog.model.js"

```
const mongoose = require("mongoose");

// This collection stores notification history.
const notificationLogSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ["SOS", "VOLUNTEER", "LOCATION_SHARE", "GEOFENCE"],
      required: true
    },
    recipientType: {
      type: String,
      enum: ["USER", "VOLUNTEER", "ADMIN", "EMERGENCY_CONTACT"],
      required: true
    },
    recipientId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    collection: "notification_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
```



## File: "src\models\postgres\digitalTouristId.model.js"

```
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
```



## File: "src\models\postgres\geofenceZone.model.js"

```
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
```



## File: "src\models\postgres\index.js"

```
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
```



## File: "src\models\postgres\trip.model.js"

```
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
```



## File: "src\models\postgres\tripStop.model.js"

```
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
```



## File: "src\models\postgres\user.model.js"

```
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
```



## File: "src\models\postgres\volunteer.model.js"

```
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
```



## File: "src\models\postgres\volunteerAssignment.model.js"

```
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
```



## File: "src\routes\auth.routes.js"

```
const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator
} = require("../validators/auth.validator");

const router = express.Router();

// Routes for register, login, and self account actions.
router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, updateProfileValidator, validate, authController.updateProfile);
router.delete("/delete-account", protect, authController.deleteAccount);

module.exports = router;
```



## File: "src\routes\dashboard.routes.js"

```
const express = require("express");
const { body } = require("express-validator");

const dashboardController = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { locationUpdateValidator } = require("../validators/location.validator");

const router = express.Router();

// Routes for dashboard data and quick actions.
router.get("/summary", protect, dashboardController.getSummary);
router.get("/recent-alerts", protect, dashboardController.getRecentAlerts);
router.post(
  "/start-trip",
  protect,
  body("tripId").isUUID().withMessage("Valid trip ID is required"),
  validate,
  dashboardController.startTrip
);
router.post("/share-location", protect, locationUpdateValidator, validate, dashboardController.shareLocation);

module.exports = router;
```



## File: "src\routes\geofence.routes.js"

```
const express = require("express");

const geofenceController = require("../controllers/geofence.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createZoneValidator,
  updateZoneValidator,
  zoneIdValidator
} = require("../validators/geofence.validator");
const { checkZoneValidator } = require("../validators/location.validator");

const router = express.Router();

// Routes for zone create, update, delete, and check.
router.post("/zones", protect, authorize("admin", "volunteer"), createZoneValidator, validate, geofenceController.createZone);
router.get("/zones", protect, geofenceController.getZones);
router.get("/zones/:id", protect, zoneIdValidator, validate, geofenceController.getZoneById);
router.put("/zones/:id", protect, authorize("admin", "volunteer"), zoneIdValidator, updateZoneValidator, validate, geofenceController.updateZone);
router.delete("/zones/:id", protect, authorize("admin"), zoneIdValidator, validate, geofenceController.deleteZone);
router.post("/check", protect, checkZoneValidator, validate, geofenceController.checkZone);

module.exports = router;
```



## File: "src\routes\index.js"

```
const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const profileRoutes = require("./profile.routes");
const dashboardRoutes = require("./dashboard.routes");
const tripRoutes = require("./trip.routes");
const locationRoutes = require("./location.routes");
const geofenceRoutes = require("./geofence.routes");
const sosRoutes = require("./sos.routes");
const volunteerRoutes = require("./volunteer.routes");

const router = express.Router();

// Main file that combines all route modules.
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/profile", profileRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/trips", tripRoutes);
router.use("/location", locationRoutes);
router.use("/geofence", geofenceRoutes);
router.use("/sos", sosRoutes);
router.use("/volunteers", volunteerRoutes);

module.exports = router;
```



## File: "src\routes\location.routes.js"

```
const express = require("express");

const locationController = require("../controllers/location.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  locationUpdateValidator,
  checkZoneValidator,
  userIdParamValidator
} = require("../validators/location.validator");

const router = express.Router();

// Routes for live tracking and location history.
router.post("/update", protect, locationUpdateValidator, validate, locationController.updateLocation);
router.get("/current/:userId", protect, userIdParamValidator, validate, locationController.getCurrentLocation);
router.get("/history/:userId", protect, userIdParamValidator, validate, locationController.getLocationHistory);
router.post("/check-zone", protect, checkZoneValidator, validate, locationController.checkZone);
router.get("/zone-status/:userId", protect, userIdParamValidator, validate, locationController.getZoneStatus);

module.exports = router;
```



## File: "src\routes\profile.routes.js"

```
const express = require("express");

const profileController = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { profileUpdateValidator } = require("../validators/profile.validator");

const router = express.Router();

// Routes for profile screen data.
router.get("/", protect, profileController.getProfile);
router.put("/", protect, profileUpdateValidator, validate, profileController.updateProfile);
router.get("/digital-id", protect, profileController.getDigitalId);
router.get("/trip-history", protect, profileController.getTripHistory);
router.get("/personal-details", protect, profileController.getPersonalDetails);

module.exports = router;
```



## File: "src\routes\sos.routes.js"

```
const express = require("express");

const sosController = require("../controllers/sos.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  triggerSOSValidator,
  notifyVolunteerValidator,
  alertIdValidator,
  alertStatusValidator
} = require("../validators/sos.validator");

const router = express.Router();

// Routes for SOS emergency features.
router.post("/trigger", protect, triggerSOSValidator, validate, sosController.triggerSOS);
router.post("/share-location", protect, triggerSOSValidator, validate, sosController.shareLocation);
router.post("/notify-volunteers", protect, authorize("admin", "volunteer", "user"), notifyVolunteerValidator, validate, sosController.notifyVolunteers);
router.get("/alerts", protect, sosController.getAlerts);
router.get("/alerts/:id", protect, alertIdValidator, validate, sosController.getAlertById);
router.put("/alerts/:id/status", protect, alertStatusValidator, validate, sosController.updateAlertStatus);

module.exports = router;
```



## File: "src\routes\trip.routes.js"

```
const express = require("express");

const tripController = require("../controllers/trip.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createTripValidator,
  updateTripValidator,
  tripIdValidator
} = require("../validators/trip.validator");

const router = express.Router();

// Routes for trip and itinerary features.
router.post("/", protect, createTripValidator, validate, tripController.createTrip);
router.get("/", protect, tripController.getTrips);
router.get("/:id", protect, tripIdValidator, validate, tripController.getTripById);
router.put("/:id", protect, tripIdValidator, updateTripValidator, validate, tripController.updateTrip);
router.delete("/:id", protect, tripIdValidator, validate, tripController.deleteTrip);
router.patch("/:id/start", protect, tripIdValidator, validate, tripController.startTrip);
router.patch("/:id/complete", protect, tripIdValidator, validate, tripController.completeTrip);

module.exports = router;
```



## File: "src\routes\user.routes.js"

```
const express = require("express");

const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { updateRoleValidator } = require("../validators/user.validator");

const router = express.Router();

// Admin routes for user management.
router.get("/", protect, authorize("admin"), userController.getUsers);
router.put("/:id/role", protect, authorize("admin"), updateRoleValidator, validate, userController.updateUserRole);

module.exports = router;
```



## File: "src\routes\volunteer.routes.js"

```
const express = require("express");

const volunteerController = require("../controllers/volunteer.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createVolunteerValidator,
  updateVolunteerValidator,
  volunteerIdValidator,
  assignVolunteerValidator,
  assignmentStatusValidator
} = require("../validators/volunteer.validator");

const router = express.Router();

// Routes for volunteer and assignment features.
router.post("/", protect, authorize("admin"), createVolunteerValidator, validate, volunteerController.createVolunteer);
router.get("/", protect, authorize("admin", "volunteer"), volunteerController.getVolunteers);
router.post("/assign", protect, authorize("admin", "volunteer"), assignVolunteerValidator, validate, volunteerController.assignVolunteer);
router.get("/assignments", protect, authorize("admin", "volunteer"), volunteerController.getAssignments);
router.put("/assignments/:id/status", protect, authorize("admin", "volunteer"), assignmentStatusValidator, validate, volunteerController.updateAssignmentStatus);
router.get("/:id", protect, authorize("admin", "volunteer"), volunteerIdValidator, validate, volunteerController.getVolunteerById);
router.put("/:id", protect, authorize("admin"), volunteerIdValidator, updateVolunteerValidator, validate, volunteerController.updateVolunteer);

module.exports = router;
```



## File: "src\server.js"

```
require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/mongo");
const sequelize = require("./config/postgres");
require("./models/postgres");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
```



## File: "src\services\auth.service.js"

```
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const { User, DigitalTouristId } = require("../models/postgres");
const generateDigitalId = require("../utils/generateDigitalId");
const { generateToken } = require("../utils/jwt");

// This removes the password before sending user data.
const sanitizeUser = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  return plain;
};

const registerUser = async (payload) => {
  // Check if the user already exists.
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email: payload.email }, { phone: payload.phone }]
    }
  });

  if (existingUser) {
    const error = new Error("User with this email or phone already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // First create the user, then create the tourist ID.
  const user = await User.create({
    ...payload,
    password: hashedPassword
  });

  const digitalId = generateDigitalId({
    userId: user.userId,
    fullName: user.fullName,
    email: user.email
  });

  user.touristIdCode = digitalId.idCode;
  await user.save();

  await DigitalTouristId.create({
    userId: user.userId,
    idCode: digitalId.idCode,
    qrValue: digitalId.qrValue,
    verifiedStatus: user.isVerified
  });

  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  });

  return { user: sanitizeUser(user), token };
};

const loginUser = async ({ email, password }) => {
  // Check email and password during login.
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  });

  return { user: sanitizeUser(user), token };
};

const getCurrentUser = async (userId) => {
  // Also get digital ID details with the user data.
  const user = await User.findByPk(userId, {
    include: [{ model: DigitalTouristId, as: "digitalId" }]
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

const updateCurrentUserProfile = async (userId, payload) => {
  // Only selected profile fields can be updated here.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  ["fullName", "phone", "emergencyContact", "profilePhoto"].forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();
  return sanitizeUser(user);
};

const deleteCurrentUser = async (userId) => {
  // Delete the user account.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await user.destroy();
  return { deleted: true };
};

const getAllUsers = async () => {
  // Get all users for admin use.
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  return users.map(sanitizeUser);
};

const updateUserRole = async (userId, role) => {
  // Admin can change the user's role.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.role = role;
  await user.save();
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUserProfile,
  deleteCurrentUser,
  getAllUsers,
  updateUserRole
};
```



## File: "src\services\dashboard.service.js"

```
const Alert = require("../models/mongo/alert.model");
const { getCurrentUser } = require("./auth.service");
const { getActiveTrip, startTrip } = require("./trip.service");
const { getZoneStatusForUser, createLocationUpdate } = require("./location.service");

// Get recent alerts for the dashboard.
const getRecentAlerts = async (userId) => Alert.find({ userId }).sort({ createdAt: -1 }).limit(5);

const getDashboardSummary = async (userId) => {
  // This combines user, trip, zone, and alert data for the home screen.
  const currentUser = await getCurrentUser(userId);
  const activeTrip = await getActiveTrip(userId);

  let zoneStatus = { zoneStatus: "OUTSIDE" };
  try {
    zoneStatus = await getZoneStatusForUser(userId);
  } catch (error) {
    zoneStatus = { zoneStatus: "OUTSIDE" };
  }

  const recentAlerts = await getRecentAlerts(userId);

  return {
    currentUser,
    activeTrip,
    zoneStatus,
    recentAlerts,
    quickActions: [
      { key: "start_trip", label: "Start Trip", endpoint: "/api/dashboard/start-trip" },
      { key: "share_location", label: "Share Location", endpoint: "/api/dashboard/share-location" },
      { key: "trigger_sos", label: "SOS", endpoint: "/api/sos/trigger" }
    ]
  };
};

const startTripFromDashboard = async (userId, tripId) => startTrip(tripId, userId);

const shareLocationFromDashboard = async (payload) =>
  // This is used when the dashboard share location button is clicked.
  createLocationUpdate({
    userId: payload.userId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    tripId: payload.tripId || null
  });

module.exports = {
  getDashboardSummary,
  getRecentAlerts,
  startTripFromDashboard,
  shareLocationFromDashboard
};
```



## File: "src\services\geofence.service.js"

```
const { v4: uuidv4 } = require("uuid");

const { GeofenceZone } = require("../models/postgres");
const GeofenceEvent = require("../models/mongo/geofenceEvent.model");
const Alert = require("../models/mongo/alert.model");
const { haversineDistance } = require("../utils/haversine");

// Bigger number means higher danger priority.
const zonePriority = {
  UNSAFE: 3,
  CAUTION: 2,
  SAFE: 1
};

const createZone = async (payload) => GeofenceZone.create(payload);

const getZones = async (filters = {}) => GeofenceZone.findAll({ where: filters, order: [["createdAt", "DESC"]] });

const getZoneById = async (zoneId) => {
  const zone = await GeofenceZone.findByPk(zoneId);
  if (!zone) {
    const error = new Error("Zone not found");
    error.statusCode = 404;
    throw error;
  }
  return zone;
};

const updateZone = async (zoneId, payload) => {
  const zone = await getZoneById(zoneId);
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      zone[key] = payload[key];
    }
  });
  await zone.save();
  return zone;
};

const deleteZone = async (zoneId) => {
  const zone = await getZoneById(zoneId);
  await zone.destroy();
  return { deleted: true };
};

const resolveZoneStatus = async ({ latitude, longitude, userId, tripId = null, createUnsafeAlert = true }) => {
  // If tripId is given, check only that trip's zones.
  const where = { isActive: true };
  if (tripId) {
    where.tripId = tripId;
  }

  const zones = await GeofenceZone.findAll({ where });
  const matchingZones = zones
    .map((zone) => {
      // Check if the location is inside the zone circle.
      const distance = haversineDistance(
        latitude,
        longitude,
        zone.centerLatitude,
        zone.centerLongitude
      );

      return {
        zone,
        distance,
        isInside: distance <= zone.radiusInMeters
      };
    })
    .filter((item) => item.isInside);

  let result = {
    zoneStatus: "OUTSIDE",
    matchedZone: null,
    distanceInMeters: null,
    alertTriggered: false
  };

  if (matchingZones.length) {
    // If many zones match, choose the most dangerous one.
    const highestPriority = matchingZones.sort(
      (a, b) => zonePriority[b.zone.zoneType] - zonePriority[a.zone.zoneType]
    )[0];

    result = {
      zoneStatus: highestPriority.zone.zoneType,
      matchedZone: highestPriority.zone,
      distanceInMeters: Number(highestPriority.distance.toFixed(2)),
      alertTriggered: false
    };

    await GeofenceEvent.create({
      eventId: uuidv4(),
      userId,
      tripId,
      zoneId: highestPriority.zone.zoneId,
      zoneType: highestPriority.zone.zoneType,
      latitude,
      longitude,
      message: `User entered ${highestPriority.zone.zoneType} zone`
    });

    if (highestPriority.zone.zoneType === "UNSAFE" && createUnsafeAlert) {
      // If the user enters an unsafe zone, create an alert automatically.
      await Alert.create({
        alertId: uuidv4(),
        userId,
        tripId,
        alertType: "GEO_FENCE",
        message: "Automatic unsafe zone alert triggered",
        latitude,
        longitude,
        severity: "HIGH",
        status: "OPEN",
        volunteersNotified: false
      });
      result.alertTriggered = true;
    }
  }

  return result;
};

module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
  resolveZoneStatus
};
```



## File: "src\services\location.service.js"

```
const { v4: uuidv4 } = require("uuid");

const LocationLog = require("../models/mongo/locationLog.model");
const { resolveZoneStatus } = require("./geofence.service");

const createLocationUpdate = async (payload) => {
  // Save location and check zone at the same time.
  const zoneResult = await resolveZoneStatus({
    latitude: payload.latitude,
    longitude: payload.longitude,
    userId: payload.userId,
    tripId: payload.tripId || null,
    createUnsafeAlert: true
  });

  const locationLog = await LocationLog.create({
    logId: uuidv4(),
    userId: payload.userId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    timestamp: payload.timestamp || new Date(),
    zoneStatus: zoneResult.zoneStatus,
    tripId: payload.tripId || null
  });

  return { locationLog, zoneResult };
};

const getCurrentLocation = async (userId) => {
  // The newest location log is the current location.
  const currentLocation = await LocationLog.findOne({ userId }).sort({ timestamp: -1 });

  if (!currentLocation) {
    const error = new Error("Current location not found");
    error.statusCode = 404;
    throw error;
  }

  return currentLocation;
};

const getLocationHistory = async (userId) =>
  LocationLog.find({ userId }).sort({ timestamp: -1 }).limit(100);

const checkLocationZone = async (payload) =>
  // Check zone without saving a new location log.
  resolveZoneStatus({
    latitude: payload.latitude,
    longitude: payload.longitude,
    userId: payload.userId,
    tripId: payload.tripId || null,
    createUnsafeAlert: true
  });

const getZoneStatusForUser = async (userId) => {
  // Get zone status from the latest saved location.
  const latestLog = await getCurrentLocation(userId);
  return {
    userId,
    zoneStatus: latestLog.zoneStatus,
    latitude: latestLog.latitude,
    longitude: latestLog.longitude,
    timestamp: latestLog.timestamp
  };
};

module.exports = {
  createLocationUpdate,
  getCurrentLocation,
  getLocationHistory,
  checkLocationZone,
  getZoneStatusForUser
};
```



## File: "src\services\notification.service.js"

```
const { v4: uuidv4 } = require("uuid");
const NotificationLog = require("../models/mongo/notificationLog.model");

// This function saves notification logs in one common way.
const createNotificationLog = async ({ type, recipientType, recipientId, message, metadata = {} }) => {
  return NotificationLog.create({
    notificationId: uuidv4(),
    type,
    recipientType,
    recipientId,
    message,
    metadata
  });
};

module.exports = { createNotificationLog };
```



## File: "src\services\profile.service.js"

```
const { User, Trip, DigitalTouristId, TripStop } = require("../models/postgres");

// This service handles profile screen data.
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: [{ model: DigitalTouristId, as: "digitalId" }]
  });

  if (!user) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateProfile = async (userId, payload) => {
  // Update profile and digital ID verification status together.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  ["fullName", "phone", "emergencyContact", "profilePhoto", "isVerified"].forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();

  const digitalId = await DigitalTouristId.findOne({ where: { userId } });
  if (digitalId) {
    digitalId.verifiedStatus = user.isVerified;
    await digitalId.save();
  }

  return getProfile(userId);
};

const getDigitalId = async (userId) => {
  // Get digital ID data for the profile screen.
  const digitalId = await DigitalTouristId.findOne({ where: { userId } });

  if (!digitalId) {
    const error = new Error("Digital tourist ID not found");
    error.statusCode = 404;
    throw error;
  }

  return digitalId;
};

const getTripHistory = async (userId) => {
  // Get trip history with all trip stops.
  return Trip.findAll({
    where: { userId },
    include: [{ model: TripStop, as: "stops" }],
    order: [["createdAt", "DESC"]]
  });
};

const getPersonalDetails = async (userId) => {
  // Get personal details without password data.
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"]
    }
  });

  if (!user) {
    const error = new Error("Personal details not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  getDigitalId,
  getTripHistory,
  getPersonalDetails
};
```



## File: "src\services\sos.service.js"

```
const { v4: uuidv4 } = require("uuid");

const Alert = require("../models/mongo/alert.model");
const { Volunteer, VolunteerAssignment } = require("../models/postgres");
const { createNotificationLog } = require("./notification.service");

const triggerSOS = async (payload) => {
  // Create the main SOS alert record.
  const alert = await Alert.create({
    alertId: uuidv4(),
    userId: payload.userId,
    tripId: payload.tripId || null,
    alertType: payload.alertType || "SOS",
    message: payload.message || "Emergency help needed",
    latitude: payload.latitude,
    longitude: payload.longitude,
    severity: payload.severity || "CRITICAL",
    status: "OPEN",
    volunteersNotified: false
  });

  await createNotificationLog({
    type: "SOS",
    recipientType: "EMERGENCY_CONTACT",
    recipientId: payload.userId,
    message: "Emergency SOS alert triggered",
    metadata: { alertId: alert.alertId }
  });

  return alert;
};

const shareSOSLocation = async (payload) =>
  // Save emergency location sharing as a notification log.
  createNotificationLog({
    type: "LOCATION_SHARE",
    recipientType: "EMERGENCY_CONTACT",
    recipientId: payload.userId,
    message: "Live emergency location shared",
    metadata: payload
  });

const notifyVolunteers = async ({ userId, alertId, tripId = null, assignedBy = null }) => {
  // First check that the alert exists.
  const alert = await Alert.findOne({ alertId });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  const volunteers = await Volunteer.findAll({
    where: { availabilityStatus: "AVAILABLE" },
    limit: 5
  });

  const assignments = [];
  for (const volunteer of volunteers) {
    // Save volunteer assignment and notification together.
    const assignment = await VolunteerAssignment.create({
      volunteerId: volunteer.volunteerId,
      userId: alert.userId || userId,
      tripId: alert.tripId || tripId,
      alertId,
      assignedBy,
      status: "ASSIGNED"
    });

    await createNotificationLog({
      type: "VOLUNTEER",
      recipientType: "VOLUNTEER",
      recipientId: volunteer.volunteerId,
      message: "You have been notified for an SOS emergency",
      metadata: { alertId, assignmentId: assignment.assignmentId }
    });

    assignments.push(assignment);
  }

  await Alert.findOneAndUpdate({ alertId }, { volunteersNotified: true });
  return assignments;
};

const getAlerts = async (filters = {}) => Alert.find(filters).sort({ createdAt: -1 });

const getAlertById = async (id) => {
  // Find alert using alertId instead of MongoDB _id.
  const alert = await Alert.findOne({ alertId: id });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

const updateAlertStatus = async (id, status) => {
  const alert = await Alert.findOneAndUpdate({ alertId: id }, { status }, { new: true });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

module.exports = {
  triggerSOS,
  shareSOSLocation,
  notifyVolunteers,
  getAlerts,
  getAlertById,
  updateAlertStatus
};
```



## File: "src\services\trip.service.js"

```
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
```



## File: "src\services\volunteer.service.js"

```
const { Volunteer, VolunteerAssignment } = require("../models/postgres");

// This service handles volunteer data and assignment data.
const createVolunteer = async (payload) => Volunteer.create(payload);

const getVolunteers = async () => Volunteer.findAll({ order: [["createdAt", "DESC"]] });

const getVolunteerById = async (volunteerId) => {
  const volunteer = await Volunteer.findByPk(volunteerId);

  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.statusCode = 404;
    throw error;
  }

  return volunteer;
};

const updateVolunteer = async (volunteerId, payload) => {
  // Update only the fields that are sent.
  const volunteer = await getVolunteerById(volunteerId);
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      volunteer[key] = payload[key];
    }
  });
  await volunteer.save();
  return volunteer;
};

const assignVolunteer = async (payload) =>
  // Assign a volunteer to a user, trip, or alert.
  VolunteerAssignment.create({
    volunteerId: payload.volunteerId,
    userId: payload.userId,
    tripId: payload.tripId || null,
    alertId: payload.alertId || null,
    assignedBy: payload.assignedBy || null,
    status: payload.status || "ASSIGNED"
  });

const getAssignments = async () =>
  // Get assignments with volunteer details.
  VolunteerAssignment.findAll({
    include: [{ model: Volunteer, as: "volunteer" }],
    order: [["assignedAt", "DESC"]]
  });

const updateAssignmentStatus = async (assignmentId, status) => {
  const assignment = await VolunteerAssignment.findByPk(assignmentId);

  if (!assignment) {
    const error = new Error("Assignment not found");
    error.statusCode = 404;
    throw error;
  }

  assignment.status = status;
  await assignment.save();
  return assignment;
};

module.exports = {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  assignVolunteer,
  getAssignments,
  updateAssignmentStatus
};
```



## File: "src\utils\apiResponse.js"

```
// This helps every API send responses in the same format.
const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors
  });
};

module.exports = sendResponse;
```



## File: "src\utils\asyncHandler.js"

```
// This sends async errors to the main error handler automatically.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```



## File: "src\utils\generateDigitalId.js"

```
const { v4: uuidv4 } = require("uuid");

// This creates a simple digital tourist ID and QR data.
const generateDigitalId = (user) => {
  const rawCode = `WST-${user.fullName.slice(0, 3).toUpperCase()}-${uuidv4().slice(0, 8)}`;

  return {
    idCode: rawCode,
    qrValue: JSON.stringify({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      digitalId: rawCode
    })
  };
};

module.exports = generateDigitalId;
```



## File: "src\utils\haversine.js"

```
const toRadians = (value) => (value * Math.PI) / 180;

// This finds the distance between two locations in meters.
const haversineDistance = (lat1, lon1, lat2, lon2) => {
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
```



## File: "src\utils\jwt.js"

```
const jwt = require("jsonwebtoken");
const env = require("../config/env");

// This creates the login token used for protected routes.
const generateToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

module.exports = { generateToken };
```



## File: "src\validators\auth.validator.js"

```
const { body } = require("express-validator");

// Validation for auth and self profile update.
exports.registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("emergencyContact").trim().notEmpty().withMessage("Emergency contact is required"),
  body("role").optional().isIn(["user", "volunteer", "admin"]).withMessage("Invalid role")
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

exports.updateProfileValidator = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("emergencyContact").optional().trim().notEmpty().withMessage("Emergency contact cannot be empty"),
  body("profilePhoto").optional().isString().withMessage("Profile photo must be a string")
];
```



## File: "src\validators\geofence.validator.js"

```
const { body, param } = require("express-validator");

// Validation for creating a new zone.
exports.createZoneValidator = [
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("zoneType").isIn(["SAFE", "CAUTION", "UNSAFE"]).withMessage("Invalid zone type"),
  body("centerLatitude").isFloat().withMessage("Valid center latitude is required"),
  body("centerLongitude").isFloat().withMessage("Valid center longitude is required"),
  body("radiusInMeters").isFloat({ gt: 0 }).withMessage("Radius must be greater than 0"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean")
];

exports.updateZoneValidator = [
  // Validation for updating zone data.
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("zoneType").optional().isIn(["SAFE", "CAUTION", "UNSAFE"]).withMessage("Invalid zone type"),
  body("centerLatitude").optional().isFloat().withMessage("Valid center latitude is required"),
  body("centerLongitude").optional().isFloat().withMessage("Valid center longitude is required"),
  body("radiusInMeters").optional().isFloat({ gt: 0 }).withMessage("Radius must be greater than 0"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean")
];

exports.zoneIdValidator = [param("id").isUUID().withMessage("Valid zone ID is required")];
```



## File: "src\validators\location.validator.js"

```
const { body, param } = require("express-validator");

// Validation for location and zone check data.
exports.locationUpdateValidator = [
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.checkZoneValidator = [
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.userIdParamValidator = [param("userId").isUUID().withMessage("Valid user ID is required")];
```



## File: "src\validators\profile.validator.js"

```
const { body } = require("express-validator");

// Validation for profile update.
exports.profileUpdateValidator = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("emergencyContact").optional().trim().notEmpty().withMessage("Emergency contact cannot be empty"),
  body("profilePhoto").optional().isString().withMessage("Profile photo must be a string"),
  body("isVerified").optional().isBoolean().withMessage("isVerified must be boolean")
];
```



## File: "src\validators\sos.validator.js"

```
const { body, param } = require("express-validator");

// Validation for SOS requests.
exports.triggerSOSValidator = [
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("alertType").optional().isIn(["SOS", "GEO_FENCE", "MANUAL", "EMERGENCY"]).withMessage("Invalid alert type"),
  body("message").optional().isString().withMessage("Message must be a string"),
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("severity").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Invalid severity")
];

exports.notifyVolunteerValidator = [
  body("alertId").notEmpty().withMessage("Alert ID is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.alertIdValidator = [param("id").notEmpty().withMessage("Alert ID is required")];

exports.alertStatusValidator = [
  param("id").notEmpty().withMessage("Alert ID is required"),
  body("status").isIn(["OPEN", "IN_PROGRESS", "RESOLVED"]).withMessage("Invalid alert status")
];
```



## File: "src\validators\trip.validator.js"

```
const { body, param } = require("express-validator");

// Validation for creating a trip.
exports.createTripValidator = [
  body("title").trim().notEmpty().withMessage("Trip title is required"),
  body("source").trim().notEmpty().withMessage("Source is required"),
  body("destination").trim().notEmpty().withMessage("Destination is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("stops").optional().isArray().withMessage("Stops must be an array")
];

exports.updateTripValidator = [
  // Validation for updating some trip fields.
  body("title").optional().trim().notEmpty().withMessage("Trip title cannot be empty"),
  body("source").optional().trim().notEmpty().withMessage("Source cannot be empty"),
  body("destination").optional().trim().notEmpty().withMessage("Destination cannot be empty"),
  body("startDate").optional().isISO8601().withMessage("Valid start date is required"),
  body("endDate").optional().isISO8601().withMessage("Valid end date is required"),
  body("geoFenceEnabled").optional().isBoolean().withMessage("geoFenceEnabled must be boolean"),
  body("currentStatus")
    .optional()
    .isIn(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid trip status"),
  body("stops").optional().isArray().withMessage("Stops must be an array")
];

exports.tripIdValidator = [param("id").isUUID().withMessage("Valid trip ID is required")];
```



## File: "src\validators\user.validator.js"

```
const { body, param } = require("express-validator");

// Validation for admin role update.
exports.updateRoleValidator = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("role").isIn(["user", "volunteer", "admin"]).withMessage("Invalid role")
];
```



## File: "src\validators\volunteer.validator.js"

```
const { body, param } = require("express-validator");

// Validation for volunteer and assignment data.
exports.createVolunteerValidator = [
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("availabilityStatus")
    .optional()
    .isIn(["AVAILABLE", "BUSY", "OFFLINE"])
    .withMessage("Invalid availability status")
];

exports.updateVolunteerValidator = [
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("availabilityStatus")
    .optional()
    .isIn(["AVAILABLE", "BUSY", "OFFLINE"])
    .withMessage("Invalid availability status"),
  body("assignedZone").optional().isString().withMessage("Assigned zone must be a string"),
  body("currentLatitude").optional().isFloat().withMessage("Current latitude must be valid"),
  body("currentLongitude").optional().isFloat().withMessage("Current longitude must be valid")
];

exports.volunteerIdValidator = [param("id").isUUID().withMessage("Valid volunteer ID is required")];

exports.assignVolunteerValidator = [
  body("volunteerId").isUUID().withMessage("Valid volunteer ID is required"),
  body("userId").isUUID().withMessage("Valid user ID is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("status")
    .optional()
    .isIn(["ASSIGNED", "ACCEPTED", "REJECTED", "RESOLVED"])
    .withMessage("Invalid assignment status")
];

exports.assignmentStatusValidator = [
  param("id").isUUID().withMessage("Valid assignment ID is required"),
  body("status")
    .isIn(["ASSIGNED", "ACCEPTED", "REJECTED", "RESOLVED"])
    .withMessage("Invalid assignment status")
];
```


