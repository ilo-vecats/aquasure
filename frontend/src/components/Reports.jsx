import React, { useEffect, useState } from 'react';
import API from '../api';
import './Reports.css';

export default function Reports() {
  const [samples, setSamples] = useState([]);
  const [filter, setFilter] = useState({
    location: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, [filter]);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.location) params.append('location', filter.location);
      if (filter.status) params.append('status', filter.status);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const res = await API.get(`/samples?${params.toString()}`);
      setSamples(res.data);
    } catch (err) {
      console.error('Error fetching samples:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Location', 'Date', 'pH', 'TDS', 'Turbidity', 'Chlorine', 'Temperature', 'Quality Index', 'Status', 'Verified', 'Notes'];
    const rows = samples.map(s => [
      s.location,
      new Date(s.timestamp).toLocaleString(),
      s.ph,
      s.tds,
      s.turbidity,
      s.chlorine,
      s.temperature || 'N/A',
      s.qualityIndex,
      s.status,
      s.verified ? 'Yes' : 'No',
      s.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquasure-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="reports-container">
      <h2>Quality Reports & Analytics</h2>
      <p className="reports-description">
        TQM Reporting: Generate reports for quality audits and analysis
      </p>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Location</label>
          <input
            type="text"
            value={filter.location}
            onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            placeholder="Filter by location"
          />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="Safe">Safe</option>
            <option value="Borderline">Borderline</option>
            <option value="Unsafe">Unsafe</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          />
        </div>
        <button onClick={exportToCSV} className="btn-export">
          Export to CSV
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <>
          <div className="results-summary">
            <p>Found {samples.length} sample(s)</p>
          </div>
          <div className="reports-table-container">
            <table className="reports-table">
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
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {samples.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No samples found</td>
                  </tr>
                ) : (
                  samples.map((sample) => (
                    <tr key={sample._id}>
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
                      <td>{sample.verified ? '✓' : '✗'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

