import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/telemetry');
        if (response.ok) {
          const newData = await response.json();
          setConnected(true);

          if (newData.status === 'waiting_for_data') {
            // Do nothing if server has no data yet
            return;
          }

          // Only update if timestamp covers a new event or first load
          setData(prev => {
            // In a real app we might check timestamps. 
            // Here we assume every fetch might have new data or we just refresh UI.
            // But for logs, we want to accumulate.
            return newData;
          });

          // Handle logs
          if (newData.logs && newData.logs.length > 0) {
            const newLogs = newData.logs.map(log => ({
              time: newData.timestamp,
              message: log
            }));

            setLogs(prev => {
              // Prepend and slice to keep last 50
              // Filter duplicates if needed, but timestamp helps
              // For simplicity, just adding them.
              const combined = [...newLogs, ...prev];
              return combined.slice(0, 50);
            });
          }
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setConnected(false);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSystemModeClass = (mode) => {
    if (!mode) return '';
    switch (mode.toUpperCase()) {
      case 'NORMAL': return 'status-normal';
      case 'WARNING': return 'status-warning';
      case 'CRITICAL': return 'status-critical';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Telemetry Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className={`status-badge ${connected ? 'status-normal' : 'status-critical'}`}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          {data && data.status && (
            <div className={`status-badge ${getSystemModeClass(data.status.system_mode)}`}>
              MODE: {data.status.system_mode}
            </div>
          )}
        </div>
      </header>

      {!data ? (
        <div className="card">
          <h3>Waiting for telemetry...</h3>
          <p>Ensure the backend is receiving data.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            <div className="card">
              <h3>Heart Rate</h3>
              <div className="vital-value" style={{ color: data.vitals.heart_rate > 100 ? 'var(--color-danger)' : 'inherit' }}>
                {data.vitals.heart_rate} <span className="vital-unit">bpm</span>
              </div>
              <div className="range-info">Baseline: 60-100</div>
            </div>

            <div className="card">
              <h3>SpO2</h3>
              <div className="vital-value" style={{ color: data.vitals.spo2 < 95 ? 'var(--color-warning)' : 'inherit' }}>
                {data.vitals.spo2} <span className="vital-unit">%</span>
              </div>
              <div className="range-info">Baseline: 95-100%</div>
            </div>

            <div className="card">
              <h3>Steps</h3>
              <div className="vital-value">
                {data.vitals.steps}
              </div>
              <div className="range-info">Daily Goal: 10,000</div>
            </div>

            <div className="card">
              <h3>System Status</h3>
              <div style={{ marginTop: '1rem' }}>
                <div><strong>Anomaly Score:</strong> {data.status.anomaly_score} / 100</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Decision:</strong>{' '}
                  <span style={{
                    color: data.status.decision === 'TRIGGERED' ? 'var(--color-danger)' : 'var(--color-success)',
                    fontWeight: 'bold'
                  }}>
                    {data.status.decision}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Event Log</h3>
            <div className="log-container">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="timestamp">[{new Date(log.time).toLocaleTimeString()}]</span>
                  {log.message}
                </div>
              ))}
              {logs.length === 0 && <div style={{ color: '#666' }}>No events logged yet.</div>}
            </div>
          </div>
        </>
      )}

      <div className="observability-note">
        <strong>NOTE:</strong> This dashboard is an observability layer only. It displays read-only data received from the system
        and does not perform independent health analysis or ml inference.
      </div>
    </div>
  );
}

export default App;
