import React, { useEffect, useState } from 'react';
import API from '../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [samples, setSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [samplesRes, statsRes] = await Promise.all([
        API.get('/samples?limit=100'),
        API.get('/samples/stats')
      ]);
      setSamples(samplesRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Check if there's no data
  const hasNoData = !samples || samples.length === 0;

  // Prepare data for charts (TQM: Control charts)
  const chartData = hasNoData ? [] : samples
    .slice()
    .reverse()
    .slice(-30) // Last 30 samples
    .map((s) => ({
      time: new Date(s.timestamp).toLocaleDateString(),
      date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      qualityIndex: s.qualityIndex,
      ph: s.ph,
      tds: s.tds,
      turbidity: s.turbidity,
      chlorine: s.chlorine,
      status: s.status
    }));

  // Status distribution data
  const statusData = stats ? [
    { name: 'Safe', value: stats.safe, color: '#27ae60' },
    { name: 'Borderline', value: stats.borderline, color: '#f39c12' },
    { name: 'Unsafe', value: stats.unsafe, color: '#e74c3c' }
  ] : [];

  // Show empty state if no data
  if (hasNoData) {
    return (
      <div className="dashboard-container">
        <h2>Quality Control Dashboard</h2>
        <div className="empty-state">
          <h3>No Data Available</h3>
          <p>You haven't submitted any water quality samples yet.</p>
          <p>Click on <strong>"Submit Sample"</strong> in the navigation to add your first sample.</p>
          <div className="empty-state-hint">
            <p><strong>Sample a sample with these values to get started:</strong></p>
            <ul>
              <li>Location: "Test Location"</li>
              <li>pH: 7.0</li>
              <li>TDS: 300</li>
              <li>Turbidity: 0.5</li>
              <li>Chlorine: 0.3</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Quality Control Dashboard</h2>
      <p className="dashboard-description">
        TQM Control Charts & Quality Metrics (PDCA Cycle Monitoring)
      </p>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Samples</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card safe">
            <h3>Safe</h3>
            <p className="stat-value">{stats.safe}</p>
          </div>
          <div className="stat-card borderline">
            <h3>Borderline</h3>
            <p className="stat-value">{stats.borderline}</p>
          </div>
          <div className="stat-card unsafe">
            <h3>Unsafe</h3>
            <p className="stat-value">{stats.unsafe}</p>
          </div>
          <div className="stat-card">
            <h3>Avg Quality Index</h3>
            <p className="stat-value">{stats.averageQualityIndex}</p>
          </div>
          <div className="stat-card">
            <h3>Avg pH</h3>
            <p className="stat-value">{stats.averagePh}</p>
          </div>
        </div>
      )}

      {/* Quality Index Trend Chart (Control Chart) */}
      <div className="chart-container">
        <h3>Quality Index Trend (Control Chart)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="qualityIndex"
              stroke="#3498db"
              strokeWidth={2}
              name="Quality Index"
            />
            <Line
              type="monotone"
              y={80}
              stroke="#27ae60"
              strokeDasharray="5 5"
              name="Safe Threshold"
            />
            <Line
              type="monotone"
              y={50}
              stroke="#e74c3c"
              strokeDasharray="5 5"
              name="Unsafe Threshold"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="chart-container">
        <h3>Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Parameter Trends */}
      <div className="chart-container">
        <h3>Parameter Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#9b59b6"
              name="pH"
            />
            <Line
              type="monotone"
              dataKey="tds"
              stroke="#e67e22"
              name="TDS"
            />
            <Line
              type="monotone"
              dataKey="turbidity"
              stroke="#1abc9c"
              name="Turbidity"
            />
            <Line
              type="monotone"
              dataKey="chlorine"
              stroke="#f1c40f"
              name="Chlorine"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Samples Table */}
      <div className="samples-table-container">
        <h3>Recent Samples</h3>
        <table className="samples-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Date</th>
              <th>pH</th>
              <th>TDS</th>
              <th>Turbidity</th>
              <th>Chlorine</th>
              <th>Quality Index</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samples.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No samples found. Submit your first sample to see data here.</td>
              </tr>
            ) : (
              samples.slice(0, 10).map((sample) => (
                <tr key={sample._id} className={`status-${sample.status.toLowerCase()}`}>
                  <td>{sample.location}</td>
                  <td>{new Date(sample.timestamp).toLocaleString()}</td>
                  <td>{sample.ph.toFixed(1)}</td>
                  <td>{sample.tds}</td>
                  <td>{sample.turbidity.toFixed(2)}</td>
                  <td>{sample.chlorine.toFixed(2)}</td>
                  <td>{sample.qualityIndex}</td>
                  <td>
                    <span className={`status-badge status-${sample.status.toLowerCase()}`}>
                      {sample.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

