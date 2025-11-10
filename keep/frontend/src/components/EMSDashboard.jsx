import React, { useState, useEffect } from 'react';
import API from '../api';
import './EMSDashboard.css';

export default function EMSDashboard() {
  const [environmentalParams, setEnvironmentalParams] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (activeTab === 'parameters') {
      fetchEnvironmentalParams();
    } else if (activeTab === 'compliance') {
      fetchCompliance();
    }
  }, [activeTab]);

  const fetchEnvironmentalParams = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      setEnvironmentalParams(getSampleParams());
    } catch (err) {
      console.error('Error fetching parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      setCompliance(getSampleCompliance());
    } catch (err) {
      console.error('Error fetching compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSampleParams = () => [
    { name: 'Water Consumption', value: 1250, unit: 'm³/day', target: 1200, status: 'Above Target' },
    { name: 'Energy Consumption', value: 850, unit: 'kWh/day', target: 900, status: 'Within Target' },
    { name: 'Wastewater Generated', value: 980, unit: 'm³/day', target: 1000, status: 'Within Target' },
    { name: 'Chemical Usage', value: 45, unit: 'kg/day', target: 50, status: 'Within Target' },
    { name: 'Carbon Footprint', value: 2.5, unit: 'tons CO2/day', target: 3.0, status: 'Within Target' }
  ];

  const getSampleCompliance = () => ({
    overall: 'Compliant',
    lastAudit: '2024-09-15',
    nextAudit: '2025-03-15',
    requirements: [
      { clause: '4.1', title: 'Understanding Organization', status: 'Compliant' },
      { clause: '4.2', title: 'Understanding Needs', status: 'Compliant' },
      { clause: '6.1', title: 'Actions to Address Risks', status: 'Compliant' },
      { clause: '6.2', title: 'Environmental Objectives', status: 'Compliant' },
      { clause: '8.1', title: 'Operational Planning', status: 'Compliant' },
      { clause: '9.1', title: 'Monitoring and Measurement', status: 'Compliant' },
      { clause: '10.2', title: 'Non-Conformity and Corrective Action', status: 'Compliant' }
    ]
  });

  const iso14001Benefits = [
    'Reduced environmental impact',
    'Compliance with environmental regulations',
    'Cost savings through resource efficiency',
    'Improved public image and reputation',
    'Better risk management',
    'Enhanced stakeholder confidence'
  ];

  const qmsEmsIntegration = [
    { area: 'Documentation', integration: 'Shared document control system' },
    { area: 'Audits', integration: 'Combined internal audit program' },
    { area: 'Management Review', integration: 'Joint management review meetings' },
    { area: 'Corrective Actions', integration: 'Unified CAPA system' },
    { area: 'Training', integration: 'Integrated training program' }
  ];

  return (
    <div className="ems-dashboard-container">
      <div className="ems-header">
        <h1>ISO 14001 Environmental Management System</h1>
        <p className="ems-subtitle">Unit 4B: ISO 14000 Series, EMS Requirements, QMS-EMS Integration</p>
      </div>

      <div className="ems-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Environmental Parameters
        </button>
        <button
          className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          Compliance
        </button>
        <button
          className={`tab-btn ${activeTab === 'integration' ? 'active' : ''}`}
          onClick={() => setActiveTab('integration')}
        >
          QMS-EMS Integration
        </button>
      </div>

      <div className="ems-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>ISO 14001 EMS Overview</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <h3>ISO 14001:2015</h3>
                <p>Environmental Management System standard focusing on environmental performance and sustainability</p>
                <div className="card-stats">
                  <div className="stat">
                    <strong>Status:</strong> <span className="status-compliant">Compliant</span>
                  </div>
                  <div className="stat">
                    <strong>Last Audit:</strong> Sep 15, 2024
                  </div>
                  <div className="stat">
                    <strong>Next Audit:</strong> Mar 15, 2025
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <h3>Benefits of ISO 14001</h3>
                <ul>
                  {iso14001Benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="overview-card">
                <h3>EMS Principles</h3>
                <ul>
                  <li>Environmental Policy</li>
                  <li>Planning (Aspects, Objectives)</li>
                  <li>Implementation and Operation</li>
                  <li>Checking and Corrective Action</li>
                  <li>Management Review</li>
                  <li>Continuous Improvement</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="parameters-section">
            <h2>Environmental Parameters Monitoring</h2>
            {loading ? (
              <div className="loading">Loading parameters...</div>
            ) : (
              <div className="parameters-grid">
                {environmentalParams.map((param, idx) => (
                  <div key={idx} className="param-card">
                    <h3>{param.name}</h3>
                    <div className="param-value">
                      <span className="value">{param.value}</span>
                      <span className="unit">{param.unit}</span>
                    </div>
                    <div className="param-target">
                      <strong>Target:</strong> {param.target} {param.unit}
                    </div>
                    <div className={`param-status ${param.status === 'Within Target' ? 'good' : 'warning'}`}>
                      {param.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compliance' && compliance && (
          <div className="compliance-section">
            <h2>ISO 14001 Compliance Status</h2>
            {loading ? (
              <div className="loading">Loading compliance data...</div>
            ) : (
              <>
                <div className="compliance-summary">
                  <div className="summary-card">
                    <h3>Overall Status</h3>
                    <div className={`summary-value ${compliance.overall.toLowerCase()}`}>
                      {compliance.overall}
                    </div>
                  </div>
                  <div className="summary-card">
                    <h3>Last Audit</h3>
                    <div className="summary-value">{new Date(compliance.lastAudit).toLocaleDateString()}</div>
                  </div>
                  <div className="summary-card">
                    <h3>Next Audit</h3>
                    <div className="summary-value">{new Date(compliance.nextAudit).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="requirements-list">
                  <h3>ISO 14001:2015 Requirements</h3>
                  {compliance.requirements.map((req, idx) => (
                    <div key={idx} className="requirement-card">
                      <div className="req-header">
                        <h4>{req.clause} - {req.title}</h4>
                        <span className={`compliance-status ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="integration-section">
            <h2>QMS-EMS Integration</h2>
            <p className="section-desc">
              Integration of Quality Management System (ISO 9001) and Environmental Management System (ISO 14001)
            </p>
            <div className="integration-grid">
              {qmsEmsIntegration.map((item, idx) => (
                <div key={idx} className="integration-card">
                  <h3>{item.area}</h3>
                  <p>{item.integration}</p>
                </div>
              ))}
            </div>
            <div className="integration-benefits">
              <h3>Benefits of Integration</h3>
              <ul>
                <li>Reduced duplication of effort</li>
                <li>Unified management system</li>
                <li>Lower certification costs</li>
                <li>Better resource utilization</li>
                <li>Consistent approach to management</li>
                <li>Improved efficiency and effectiveness</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

