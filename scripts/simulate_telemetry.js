const http = require('http');

const ENDPOINT = 'http://localhost:3001/api/telemetry';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSnapshot() {
    const isAnomaly = Math.random() > 0.9; // 10% chance of anomaly

    let heartRate = getRandomInt(60, 100);
    let spo2 = getRandomInt(95, 100);
    let systemMode = 'NORMAL';
    let anomalyScore = getRandomInt(0, 20);

    if (isAnomaly) {
        heartRate = getRandomInt(110, 150);
        spo2 = getRandomInt(85, 94);
        systemMode = 'WARNING';
        anomalyScore = getRandomInt(50, 90);
    }

    return {
        timestamp: new Date().toISOString(),
        vitals: {
            heart_rate: heartRate,
            spo2: spo2,
            steps: getRandomInt(0, 10000)
        },
        status: {
            system_mode: systemMode,
            anomaly_score: anomalyScore,
            decision: isAnomaly ? 'TRIGGERED' : 'NONE'
        },
        logs: [
            `System verified at ${new Date().toLocaleTimeString()}`,
            `Sensor A: OK`,
            isAnomaly ? `ANOMALY DETECTED: HR ${heartRate}` : null
        ].filter(Boolean)
    };
}

function sendTelemetry() {
    const data = JSON.stringify(generateSnapshot());

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/telemetry',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        // console.log(`statusCode: ${res.statusCode}`);
    });

    req.on('error', (error) => {
        console.error('Error sending telemetry:', error.message);
    });

    req.write(data);
    req.end();

    console.log('Sent snapshot:', data);
}

// Send data every 2 seconds
setInterval(sendTelemetry, 2000);
console.log('Simulation started. Sending data to ' + ENDPOINT + ' every 2s...');
