# Telemetry Visualization Dashboard

An independent, read-only telemetry visualization dashboard for a mobile health monitoring system. 
This project serves as an **observability layer** and does not perform any health analysis or modify data.

## features
- **Live Vitals**: Real-time display of Heart Rate, SpO2, and Steps.
- **System Status**: Monitor System Mode, Anomaly Scores, and Decision Triggers.
- **Event Log**: Scrolling log of recent system events.
- **Read-Only**: Treats all incoming data as immutable.
- **Ephemeral**: Stores only the latest snapshot in memory.

## Architecture
- **Backend**: Node.js / Express (Port 3001)
- **Frontend**: React / Vite (Port 5173 - Dev)
- **Deployment**: The backend serves the compiled frontend static files, allowing for a single service deployment.

## Local Development

1. **Install Dependencies**
   ```bash
   cd server && npm install
   cd client && npm install
   ```

2. **Start Backend**
   ```bash
   cd server
   npm start
   ```

3. **Start Frontend (Dev Mode)**
   ```bash
   cd client
   npm run dev
   ```

4. **Simulate Telemetry Data**
   ```bash
   node scripts/simulate_telemetry.js
   ```

## Deployment (Render/Vercel)

This project is configured to be deployed as a standard Node.js web service.

1. **Build Frontend**: `cd client && npm run build`
2. **Start Server**: `cd server && npm start`

The server is configured to serve the `client/dist` directory.
