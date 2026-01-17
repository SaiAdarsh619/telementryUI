const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for the latest snapshot
let latestSnapshot = null;

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

    latestSnapshot = data;
    console.log('[Telemetry] Received snapshot:', JSON.stringify(data).substring(0, 100) + '...');
    res.json({ status: 'received' });
});

app.get('/api/telemetry', (req, res) => {
    res.json(latestSnapshot || { status: 'waiting_for_data' });
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
