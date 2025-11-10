import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './PredictiveMonitoring.css';

export default function PredictiveMonitoring() {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [daysAhead, setDaysAhead] = useState(7);
  const [predictionError, setPredictionError] = useState(null);

  useEffect(() => {
    fetchLocations();
    fetchAlerts();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchPredictions();
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      const res = await API.get('/samples');
      const uniqueLocations = [...new Set(res.data.map(s => s.location))];
      setLocations(uniqueLocations);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchPredictions = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    setPredictionError(null);
    try {
      const res = await API.get(`/predictions?location=${selectedLocation}`);
      setPredictions(res.data);
      if (!res.data || res.data.length === 0) {
        setPredictionError('No predictions generated yet for this location. Click "Generate Prediction" to create one.');
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setPredictionError(err.response?.data?.error || 'Unable to load predictions for this location.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/predictions/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/predictions/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const generatePrediction = async () => {
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }
    setGenerating(true);
    try {
      await API.get(`/predictions/generate?location=${selectedLocation}&daysAhead=${daysAhead}`);
      await fetchPredictions();
      await fetchAlerts();
      await fetchStats();
      alert('Prediction generated successfully!');
    } catch (err) {
      alert('Error generating prediction: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#eab308';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="predictive-container">
      <div className="predictive-header">
        <h2>🔮 Predictive Quality Monitoring System</h2>
        <p className="predictive-description">
          <strong>Unique Feature:</strong> Predict quality issues BEFORE they occur and get automated corrective action recommendations
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Predictions</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value" style={{ color: stats.active > 0 ? '#ef4444' : '#10b981' }}>
              {stats.active}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Critical Risks</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.critical}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Accuracy</div>
            <div className="stat-value">{(stats.averageAccuracy ?? 0).toFixed(2)}%</div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>🚨 Active High-Risk Predictions</h3>
          <div className="alerts-grid">
            {alerts.slice(0, 6).map((alert, idx) => (
              <div key={idx} className="alert-card" style={{ borderLeft: `4px solid ${getRiskColor(alert.riskLevel)}` }}>
                <div className="alert-header">
                  <span className="alert-location">{alert.location}</span>
                  <span className="alert-risk" style={{ color: getRiskColor(alert.riskLevel) }}>
                    {alert.riskLevel}
                  </span>
                </div>
                <div className="alert-body">
                  <p><strong>Predicted QI:</strong> {alert.predictedQualityIndex}</p>
                  <p><strong>Risk Score:</strong> {alert.riskScore}/100</p>
                  <p><strong>Date:</strong> {new Date(alert.predictionDate).toLocaleDateString()}</p>
                  <p><strong>Actions:</strong> {alert.recommendedActions?.length || 0} recommended</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction Generator */}
      <div className="prediction-generator">
        <h3>Generate Quality Prediction</h3>
        <div className="generator-controls">
          <div className="control-group">
            <label>Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="location-select"
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Days Ahead:</label>
            <input
              type="number"
              value={daysAhead}
              onChange={(e) => setDaysAhead(parseInt(e.target.value))}
              min="1"
              max="30"
              className="days-input"
            />
          </div>
          <button
            onClick={generatePrediction}
            disabled={!selectedLocation || generating}
            className="btn-generate"
          >
            {generating ? 'Generating...' : 'Generate Prediction'}
          </button>
        </div>
      </div>

      {/* Predictions List */}
      {selectedLocation && (
        <div className="predictions-section">
          <h3>Predictions for {selectedLocation}</h3>
          {loading ? (
            <div className="loading">Loading predictions...</div>
          ) : predictions.length === 0 ? (
            <div className="no-predictions">
              <p>{predictionError || 'No predictions yet. Generate one to see forecasted quality.'}</p>
            </div>
          ) : (
            <div className="predictions-list">
              {predictions.map((pred, idx) => (
                <div key={idx} className="prediction-card" style={{ borderLeft: `4px solid ${getRiskColor(pred.riskLevel)}` }}>
                  <div className="prediction-header">
                    <h4>Prediction for {new Date(pred.predictionDate).toLocaleDateString()}</h4>
                    <span className="risk-badge" style={{ backgroundColor: getRiskColor(pred.riskLevel) }}>
                      {pred.riskLevel} Risk
                    </span>
                  </div>
                  <div className="prediction-body">
                    <div className="prediction-metrics">
                      <div className="metric">
                        <label>Predicted Quality Index:</label>
                        <span className="metric-value">{pred.predictedQualityIndex}</span>
                      </div>
                      <div className="metric">
                        <label>Risk Score:</label>
                        <span className="metric-value">{pred.riskScore}/100</span>
                      </div>
                      <div className="metric">
                        <label>Confidence:</label>
                        <span className="metric-value">{pred.historicalPattern?.confidence || 'N/A'}%</span>
                      </div>
                      <div className="metric">
                        <label>Data Source:</label>
                        <span className="metric-value">
                          {pred.dataSource === 'global' ? 'City-wide Trend' : 'Location History'}
                        </span>
                      </div>
                    </div>

                    {pred.predictedParameters && (
                      <div className="predicted-params">
                        <h5>Predicted Parameters:</h5>
                        <div className="params-grid">
                          {Object.entries(pred.predictedParameters).map(([param, data]) => (
                            <div key={param} className="param-item">
                              <span className="param-name">{param.toUpperCase()}:</span>
                              <span className="param-value">{data.value}</span>
                              <span className="param-confidence">({data.confidence}% confidence)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pred.riskFactors && pred.riskFactors.length > 0 && (
                      <div className="risk-factors">
                        <h5>Risk Factors:</h5>
                        <ul>
                          {pred.riskFactors.map((factor, fIdx) => (
                            <li key={fIdx}>
                              <strong>{factor.factor}:</strong> {factor.description} (Impact: {factor.impact})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pred.recommendedActions && pred.recommendedActions.length > 0 && (
                      <div className="recommended-actions">
                        <h5>🤖 Automated Recommendations:</h5>
                        <div className="actions-list">
                          {pred.recommendedActions.slice(0, 3).map((action, aIdx) => (
                            <div key={aIdx} className="action-item">
                              <div className="action-header">
                                <span className="action-priority" style={{ color: getRiskColor(action.priority) }}>
                                  {action.priority}
                                </span>
                                <span className="action-category">{action.category}</span>
                              </div>
                              <p className="action-text">{action.action}</p>
                              <div className="action-details">
                                <span>Impact: {action.estimatedImpact}%</span>
                                <span>Cost: ₹{action.estimatedCost}</span>
                                <span>Time: {action.implementationTime}</span>
                                <span>Success: {Math.round(action.successProbability * 100)}%</span>
                              </div>
                              <small className="action-based">Based on: {action.basedOn}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

