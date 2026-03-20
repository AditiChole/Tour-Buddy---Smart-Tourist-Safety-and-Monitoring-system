# Installation Instructions for Tour Buddy

## Table of Contents
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Volunteer App Setup](#volunteer-app-setup)
- [AI Server Setup](#ai-server-setup)
- [Blockchain ID Setup](#blockchain-id-setup)
- [Docker Compose Quick Start](#docker-compose-quick-start)
- [Manual Setup Steps](#manual-setup-steps)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Verification Checklist](#verification-checklist)
- [Troubleshooting Guide](#troubleshooting-guide)

## Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/AditiChole/Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system.git
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the provided `.env.example`. Make sure to fill in the necessary variables.
4. Run the server:
   ```bash
   npm start
   ```

## Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the provided `.env.example`. Adjust the variables accordingly.
4. Run the application:
   ```bash
   npm start
   ```

## Volunteer App Setup
1. Navigate to the volunteer app directory:
   ```bash
   cd volunteer-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file as needed.
4. Start the Volunteer App:
   ```bash
   npm start
   ```

## AI Server Setup
1. Navigate to the AI server directory:
   ```bash
   cd ai-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file.
4. Start the AI Server:
   ```bash
   npm start
   ```

## Blockchain ID Setup
1. Ensure you have the necessary blockchain prerequisites installed.
2. Follow instructions provided in the `blockchain/README.md` for configuration and setup.

## Docker Compose Quick Start
1. Ensure Docker and Docker Compose are installed on your machine.
2. In the root directory of the project, run:
   ```bash
   docker-compose up --build
   ```
3. This command will start all services defined in the `docker-compose.yml` file.

## Manual Setup Steps
1. Ensure that all components are configured per the setup instructions above.
2. Make sure all services are running.

## Database Configuration
1. Create a database using your database management tool.
2. Update the database connection settings in your `.env` file.
3. Run migrations if applicable to set up the database schema.

## Environment Variables
- Make sure to configure the following environment variables in your `.env` file:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASS`
  - `API_KEY`
  - Any other component-specific variables.

## Verification Checklist
- [ ] All services are running.
- [ ] Environment variables are configured.
- [ ] API endpoints are accessible.
- [ ] Frontend displays without errors.

## Troubleshooting Guide
- If the backend is not responding, check:
  - Logs for errors.
  - Necessary services are up.
- If database connection fails:
  - Verify database credentials.
  - Confirm that the database server is running.
- Seek help in the repository issues section if challenges persist.

---