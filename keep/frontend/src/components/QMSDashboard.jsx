import React, { useState, useEffect } from 'react';
import API from '../api';
import './QMSDashboard.css';

export default function QMSDashboard() {
  const [audits, setAudits] = useState([]);
  const [capas, setCapas] = useState([]);
  const [nonConformances, setNonConformances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (activeTab === 'audits') {
      fetchAudits();
    } else if (activeTab === 'capas') {
      fetchCAPAs();
    } else if (activeTab === 'nonconformances') {
      fetchNonConformances();
    }
  }, [activeTab]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await API.get('/qms/audits');
      setAudits(res.data);
    } catch (err) {
      console.error('Error fetching audits:', err);
      setAudits(getSampleAudits());
    } finally {
      setLoading(false);
    }
  };

  const fetchCAPAs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/qms/capas');
      setCapas(res.data);
    } catch (err) {
      console.error('Error fetching CAPAs:', err);
      setCapas(getSampleCAPAs());
    } finally {
      setLoading(false);
    }
  };

  const fetchNonConformances = async () => {
    setLoading(true);
    try {
      const res = await API.get('/qms/non-conformances');
      setNonConformances(res.data);
    } catch (err) {
      console.error('Error fetching non-conformances:', err);
      setNonConformances(getSampleNonConformances());
    } finally {
      setLoading(false);
    }
  };

  const getSampleAudits = () => [
    {
      _id: '1',
      auditId: 'AUD-001',
      type: 'Internal',
      scope: 'Water Quality Testing Process',
      standard: 'ISO 9001',
      scheduledDate: '2024-10-01',
      status: 'Completed',
      result: 'Pass',
      findings: [
        { clause: '7.5.1', description: 'Documentation needs improvement', severity: 'Minor' }
      ]
    }
  ];

  const getSampleCAPAs = () => [
    {
      _id: '1',
      capaId: 'CAPA-001',
      type: 'Corrective Action',
      source: 'Audit Finding',
      description: 'Improve sample collection documentation',
      status: 'In Progress',
      priority: 'High'
    }
  ];

  const getSampleNonConformances = () => ({
    total: 15,
    bySeverity: { critical: 2, major: 5, minor: 8 },
    samples: []
  });

  const iso9001Requirements = [
    { clause: '4.1', title: 'Understanding the Organization', status: 'Compliant' },
    { clause: '4.2', title: 'Understanding Needs and Expectations', status: 'Compliant' },
    { clause: '5.1', title: 'Leadership and Commitment', status: 'Compliant' },
    { clause: '6.1', title: 'Actions to Address Risks', status: 'Compliant' },
    { clause: '7.1', title: 'Resources', status: 'Compliant' },
    { clause: '7.5', title: 'Documented Information', status: 'Partially Compliant' },
    { clause: '8.1', title: 'Operational Planning', status: 'Compliant' },
    { clause: '8.5', title: 'Production and Service Provision', status: 'Compliant' },
    { clause: '9.1', title: 'Monitoring, Measurement, Analysis', status: 'Compliant' },
    { clause: '10.1', title: 'Non-Conformity and Corrective Action', status: 'Compliant' }
  ];

  return (
    <div className="qms-dashboard-container">
      <div className="qms-header">
        <h1>ISO 9001 Quality Management System</h1>
        <p className="qms-subtitle">Unit 4A: ISO 9000 Series, QMS Requirements, Audits, Registration</p>
      </div>

      <div className="qms-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'audits' ? 'active' : ''}`}
          onClick={() => setActiveTab('audits')}
        >
          Audits
        </button>
        <button
          className={`tab-btn ${activeTab === 'capas' ? 'active' : ''}`}
          onClick={() => setActiveTab('capas')}
        >
          CAPA
        </button>
        <button
          className={`tab-btn ${activeTab === 'nonconformances' ? 'active' : ''}`}
          onClick={() => setActiveTab('nonconformances')}
        >
          Non-Conformances
        </button>
        <button
          className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          ISO 9001 Requirements
        </button>
      </div>

      <div className="qms-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>ISO 9001 QMS Overview</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <h3>ISO 9001:2015</h3>
                <p>Quality Management System standard focusing on customer satisfaction and continuous improvement</p>
                <div className="card-stats">
                  <div className="stat">
                    <strong>Status:</strong> <span className="status-compliant">Compliant</span>
                  </div>
                  <div className="stat">
                    <strong>Last Audit:</strong> Oct 1, 2024
                  </div>
                  <div className="stat">
                    <strong>Next Audit:</strong> Jan 1, 2025
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <h3>Benefits of ISO 9001</h3>
                <ul>
                  <li>Improved customer satisfaction</li>
                  <li>Better process efficiency</li>
                  <li>Reduced waste and costs</li>
                  <li>Enhanced market reputation</li>
                  <li>Compliance with regulations</li>
                </ul>
              </div>
              <div className="overview-card">
                <h3>QMS Principles</h3>
                <ul>
                  <li>Customer Focus</li>
                  <li>Leadership</li>
                  <li>Engagement of People</li>
                  <li>Process Approach</li>
                  <li>Continuous Improvement</li>
                  <li>Evidence-Based Decisions</li>
                  <li>Relationship Management</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="audits-section">
            <h2>Audit Management</h2>
            {loading ? (
              <div className="loading">Loading audits...</div>
            ) : (
              <div className="audits-list">
                {audits.map(audit => (
                  <div key={audit._id} className="audit-card">
                    <div className="audit-header">
                      <h3>{audit.auditId} - {audit.scope}</h3>
                      <span className={`status-badge status-${audit.status.toLowerCase().replace(' ', '-')}`}>
                        {audit.status}
                      </span>
                    </div>
                    <div className="audit-details">
                      <p><strong>Type:</strong> {audit.type}</p>
                      <p><strong>Standard:</strong> {audit.standard}</p>
                      <p><strong>Scheduled Date:</strong> {new Date(audit.scheduledDate).toLocaleDateString()}</p>
                      <p><strong>Result:</strong> <span className={`result-${audit.result?.toLowerCase()}`}>{audit.result}</span></p>
                    </div>
                    {audit.findings && audit.findings.length > 0 && (
                      <div className="audit-findings">
                        <strong>Findings:</strong>
                        <ul>
                          {audit.findings.map((finding, idx) => (
                            <li key={idx}>
                              <strong>{finding.clause}:</strong> {finding.description} ({finding.severity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'capas' && (
          <div className="capas-section">
            <h2>Corrective and Preventive Actions (CAPA)</h2>
            {loading ? (
              <div className="loading">Loading CAPAs...</div>
            ) : (
              <div className="capas-list">
                {capas.map(capa => (
                  <div key={capa._id} className="capa-card">
                    <div className="capa-header">
                      <h3>{capa.capaId} - {capa.type}</h3>
                      <span className={`priority-badge priority-${capa.priority.toLowerCase()}`}>
                        {capa.priority}
                      </span>
                    </div>
                    <div className="capa-details">
                      <p><strong>Source:</strong> {capa.source}</p>
                      <p><strong>Description:</strong> {capa.description}</p>
                      <p><strong>Status:</strong> {capa.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nonconformances' && nonConformances && (
          <div className="nonconformances-section">
            <h2>Non-Conformances</h2>
            {loading ? (
              <div className="loading">Loading non-conformances...</div>
            ) : (
              <>
                <div className="nc-summary">
                  <div className="nc-card">
                    <h3>Total Non-Conformances</h3>
                    <div className="nc-value">{nonConformances.total}</div>
                  </div>
                  <div className="nc-card">
                    <h3>Critical</h3>
                    <div className="nc-value critical">{nonConformances.bySeverity.critical}</div>
                  </div>
                  <div className="nc-card">
                    <h3>Major</h3>
                    <div className="nc-value major">{nonConformances.bySeverity.major}</div>
                  </div>
                  <div className="nc-card">
                    <h3>Minor</h3>
                    <div className="nc-value minor">{nonConformances.bySeverity.minor}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="requirements-section">
            <h2>ISO 9001:2015 Requirements Compliance</h2>
            <div className="requirements-list">
              {iso9001Requirements.map((req, idx) => (
                <div key={idx} className="requirement-card">
                  <div className="req-header">
                    <h3>{req.clause} - {req.title}</h3>
                    <span className={`compliance-status ${req.status.toLowerCase().replace(' ', '-')}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

