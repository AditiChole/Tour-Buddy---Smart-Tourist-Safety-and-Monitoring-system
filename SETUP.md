# Tour Buddy Setup Guide  

Welcome to the Tour Buddy installation and setup guide. This document provides comprehensive instructions for setting up all five components of the Tour Buddy project:

## Table of Contents  
1. [Backend (Database)](#backend-db)  
2. [Frontend](#frontend)  
3. [AI Server](#ai-server)  
4. [Volunteer App](#volunteer-app)  
5. [Blockchain ID](#blockchain-id)  

## Backend (Database)  
### Requirements  
- Node.js and npm  
- MongoDB or PostgreSQL  

### Installation Steps  
1. Clone the backend repository:  
   ```bash  
   git clone https://github.com/AditiChole/Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system.git  
   ```  
2. Navigate to the backend directory:  
   ```bash  
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/backend  
   ```  
3. Install dependencies:  
   ```bash  
   npm install  
   ```  
4. Set up your database and update the connection string in the `.env` file.  
5. Start the backend server:  
   ```bash  
   npm start  
   ```  

## Frontend  
### Requirements  
- Node.js and npm  

### Installation Steps  
1. Navigate to the frontend directory:  
   ```bash  
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/frontend  
   ```  
2. Install dependencies:  
   ```bash  
   npm install  
   ```  
3. Start the development server:  
   ```bash  
   npm start  
   ```  

## AI Server  
### Requirements  
- Python 3.x  
- Flask or FastAPI  

### Installation Steps  
1. Navigate to the AI server directory:  
   ```bash  
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/ai-server  
   ```  
2. Create a virtual environment:  
   ```bash  
   python -m venv venv  
   source venv/bin/activate  
   ```  
3. Install dependencies:  
   ```bash  
   pip install -r requirements.txt  
   ```  
4. Start the AI server:  
   ```bash  
   python app.py  
   ```  

## Volunteer App  
### Requirements  
- Android Studio (for Android app)  
- Xcode (for iOS app)  

### Installation Steps  
1. Navigate to the volunteer app directory:  
   ```bash  
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/volunteer-app  
   ```  
2. Open the project in Android Studio or Xcode.  
3. Install necessary SDKs and dependencies.  
4. Run the app on an emulator or real device.  

## Blockchain ID  
### Requirements  
- Node.js and npm  

### Installation Steps  
1. Navigate to the Blockchain ID directory:  
   ```bash  
   cd Tour-Buddy---Smart-Tourist-Safety-and-Monitoring-system/blockchain-id  
   ```  
2. Install dependencies:  
   ```bash  
   npm install  
   ```  
3. Start the blockchain service:  
   ```bash  
   npm start  
   ```  

## Conclusion  
Following these steps will set up the Tour Buddy project successfully. If you encounter any issues, please refer to the respective component documentation for troubleshooting tips.