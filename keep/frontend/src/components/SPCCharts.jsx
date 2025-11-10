import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import './SPCCharts.css';

export default function SPCCharts() {
  const [parameter, setParameter] = useState('qualityIndex');
  const [xBarData, setXBarData] = useState(null);
  const [rChartData, setRChartData] = useState(null);
  const [processCapability, setProcessCapability] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSPCData();
  }, [parameter]);

  const fetchSPCData = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/spc/xbar-r-chart?parameter=${parameter}&subgroupSize=5`);
      setXBarData(response.data.xBarChart);
      setRChartData(response.data.rChart);
      setProcessCapability(response.data.processCapability);
      setViolations(response.data.violations || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spc-loading">Loading SPC charts...</div>;
  }

  if (error || !xBarData) {
    return <div className="spc-error">Error loading chart data: {error || 'No data available'}</div>;
  }

  const xBarChartData = xBarData.data.map((val, idx) => ({
    subgroup: idx + 1,
    value: val
  }));

  const rChartDataPoints = rChartData.data.map((val, idx) => ({
    subgroup: idx + 1,
    range: val
  }));

  return (
    <div className="spc-charts-container">
      <div className="spc-header">
        <h2>Statistical Process Control (SPC) Analysis</h2>
        <div className="parameter-selector">
          <label htmlFor="parameter-select">Parameter: </label>
          <select
            id="parameter-select"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            className="parameter-select"
          >
            <option value="qualityIndex">Quality Index</option>
            <option value="ph">pH</option>
            <option value="tds">TDS</option>
            <option value="turbidity">Turbidity</option>
            <option value="chlorine">Chlorine</option>
          </select>
        </div>
      </div>

      {/* Process Capability Summary */}
      {processCapability && (
        <div className="capability-summary">
          <div className="capability-card">
            <div className="capability-label">Cp</div>
            <div className="capability-value">{processCapability.cp?.toFixed(3) || 'N/A'}</div>
            <div className="capability-desc">Process Capability</div>
          </div>
          <div className="capability-card">
            <div className="capability-label">Cpk</div>
            <div className="capability-value">{processCapability.cpk?.toFixed(3) || 'N/A'}</div>
            <div className="capability-desc">Capability Index</div>
          </div>
          <div className="capability-card">
            <div className="capability-label">Mean</div>
            <div className="capability-value">{processCapability.mean?.toFixed(2) || 'N/A'}</div>
            <div className="capability-desc">Process Average</div>
          </div>
          <div className="capability-card">
            <div className="capability-label">Std Dev</div>
            <div className="capability-value">{processCapability.stdDev?.toFixed(3) || 'N/A'}</div>
            <div className="capability-desc">Variation</div>
          </div>
        </div>
      )}

      {/* Violations Alert */}
      {violations.length > 0 && (
        <div className="violations-alert">
          <div className="violations-header">
            <span className="violations-icon">⚠️</span>
            <strong>Out-of-Control Conditions Detected</strong>
          </div>
          <ul className="violations-list">
            {violations.slice(0, 5).map((v, idx) => (
              <li key={idx}>
                Point {v.index + 1}: {v.rule} ({v.severity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* X-bar Chart */}
      <div className="chart-card">
        <h3>X-bar Chart (Subgroup Averages)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={xBarChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subgroup" label={{ value: 'Subgroup Number', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: parameter, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={xBarData.ucl} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
            <ReferenceLine y={xBarData.centerLine} stroke="#10b981" label="Center Line" />
            <ReferenceLine y={xBarData.lcl} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Average" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* R Chart */}
      <div className="chart-card">
        <h3>R Chart (Subgroup Ranges)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rChartDataPoints}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subgroup" label={{ value: 'Subgroup Number', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Range', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={rChartData.ucl} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
            <ReferenceLine y={rChartData.centerLine} stroke="#10b981" label="R-bar" />
            <ReferenceLine y={rChartData.lcl} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
            <Line type="monotone" dataKey="range" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Range" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

