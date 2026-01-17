const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for the aggregated state
let latestSnapshot = {
    timestamp: new Date().toISOString(),
    vitals: {
        heart_rate: 0,
        spo2: 0,
        steps: 0
    },
    status: {
        system_mode: 'WAITING',
        anomaly_score: 0,
        decision: 'NONE'
    },
    logs: []
};

// Endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/telemetry', (req, res) => {
    const data = req.body;

    // Basic validation: Check if data is an object
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Add timestamp if not present
    if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
    }

    // HANDLE DATA AGGREGATION
    if (data.vital_type) {
        // Case 1: Stream of individual events (HEART_RATE, SPO2, etc.)
        latestSnapshot.timestamp = data.timestamp;

        // Update specific vital
        if (data.vital_type === 'HEART_RATE') {
            latestSnapshot.vitals.heart_rate = data.value;
        } else if (data.vital_type === 'SPO2') {
            latestSnapshot.vitals.spo2 = data.value;
        } else if (data.vital_type === 'STEPS') {
            latestSnapshot.vitals.steps = data.value;
        }

        // Update status info if present
        if (data.status) latestSnapshot.status.system_mode = data.status;
        if (data.decision) latestSnapshot.status.decision = data.decision;

        // Update logs for the frontend
        latestSnapshot.logs = [`${data.vital_type} updated to ${data.value}`];

        // Console log
        console.log(`[Telemetry] Updated ${data.vital_type}: ${data.value}`);

    } else if (data.vitals) {
        // Case 2: Full snapshot (Legacy/Simulator behavior)
        latestSnapshot = data;
        console.log('[Telemetry] Received full snapshot');
    } else {
        // Unknown format, just log it
        console.warn('[Telemetry] Received unknown data format:', JSON.stringify(data));
    }

    res.json({ status: 'received' });
});

app.get('/api/telemetry', (req, res) => {
    res.json(latestSnapshot);
});

// Serve static files from the React client (for production deployment)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
            if (err) {
                // If client is not built yet, just send a basic message or 404
                res.status(404).send("Client not built or found. Please run 'npm run build' in the client directory.");
            }
        });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
