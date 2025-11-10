import React, { useState, useEffect } from 'react';
import API from '../api';
import './EmployeeInvolvement.css';

export default function EmployeeInvolvement() {
  const [qualityCircles, setQualityCircles] = useState([]);
  const [newCircle, setNewCircle] = useState({ name: '', objective: '', members: '' });
  const [activeTab, setActiveTab] = useState('quality-circles');

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use sample data
    setQualityCircles([
      {
        id: 1,
        name: 'Water Quality Improvement Circle',
        objective: 'Improve pH consistency across distribution network',
        members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        status: 'Active',
        meetings: 5,
        suggestions: 12,
        implemented: 3
      },
      {
        id: 2,
        name: 'Process Efficiency Circle',
        objective: 'Reduce sample collection time by 20%',
        members: ['Sarah Williams', 'Tom Brown'],
        status: 'Active',
        meetings: 3,
        suggestions: 8,
        implemented: 2
      }
    ]);
  }, []);

  const tqmPrinciples = [
    {
      title: 'Quality Functions',
      description: 'Clear definition of quality responsibilities at all levels',
      implementation: 'Role-based access, quality responsibilities matrix'
    },
    {
      title: 'Motivation',
      description: 'Incentivizing quality performance and improvement',
      implementation: 'Recognition programs, quality awards, performance metrics'
    },
    {
      title: 'Decentralization',
      description: 'Empowering employees to make quality decisions',
      implementation: 'Quality circles, employee suggestions, autonomous teams'
    },
    {
      title: 'Empowerment',
      description: 'Giving employees authority and resources to improve quality',
      implementation: 'PDCA projects, Kaizen events, improvement initiatives'
    },
    {
      title: 'Operator Responsibility',
      description: 'Operators responsible for quality at their workstations',
      implementation: 'Self-inspection, process control, immediate feedback'
    }
  ];

  const organizationalStructure = {
    topManagement: {
      role: 'Quality Leadership',
      responsibilities: ['Quality Policy', 'Resource Allocation', 'Strategic Planning']
    },
    middleManagement: {
      role: 'Quality Coordination',
      responsibilities: ['Process Management', 'Team Leadership', 'Improvement Projects']
    },
    employees: {
      role: 'Quality Execution',
      responsibilities: ['Quality Circles', 'Suggestions', 'Continuous Improvement']
    }
  };

  return (
    <div className="employee-involvement-container">
      <div className="ei-header">
        <h1>Employee Involvement & Continuous Improvement</h1>
        <p className="ei-subtitle">Unit 2: Quality Functions, Motivation, Empowerment, and Improvement</p>
      </div>

      <div className="ei-tabs">
        {/* Implementation-focused: hide theory overview */}
        <button
          className={`tab-btn ${activeTab === 'quality-circles' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality-circles')}
        >
          Quality Circles
        </button>
        <button
          className={`tab-btn ${activeTab === 'improvement' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvement')}
        >
          Improvement Projects
        </button>
        {/* Implementation-focused: hide org structure */}
      </div>

      <div className="ei-content">
        {/* Implementation-focused: remove theory overview section */}

        {activeTab === 'quality-circles' && (
          <div className="quality-circles-section">
            <h2>Quality Circles</h2>
            <p className="section-desc">
              Small groups of employees who voluntarily meet to identify, analyze, and solve quality-related problems.
            </p>

            <div className="circles-grid">
              {qualityCircles.map(circle => (
                <div key={circle.id} className="circle-card">
                  <div className="circle-header">
                    <h3>{circle.name}</h3>
                    <span className={`status-badge status-${circle.status.toLowerCase()}`}>
                      {circle.status}
                    </span>
                  </div>
                  <p className="circle-objective"><strong>Objective:</strong> {circle.objective}</p>
                  <div className="circle-members">
                    <strong>Members:</strong>
                    <ul>
                      {circle.members.map((member, idx) => (
                        <li key={idx}>{member}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="circle-stats">
                    <div className="stat-item">
                      <span className="stat-label">Meetings:</span>
                      <span className="stat-value">{circle.meetings}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Suggestions:</span>
                      <span className="stat-value">{circle.suggestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Implemented:</span>
                      <span className="stat-value">{circle.implemented}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="new-circle-form">
              <h3>Create New Quality Circle</h3>
              <div className="form-group">
                <label>Circle Name:</label>
                <input
                  type="text"
                  value={newCircle.name}
                  onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                  placeholder="Enter circle name"
                />
              </div>
              <div className="form-group">
                <label>Objective:</label>
                <textarea
                  value={newCircle.objective}
                  onChange={(e) => setNewCircle({ ...newCircle, objective: e.target.value })}
                  placeholder="Describe the objective"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Members (comma-separated):</label>
                <input
                  type="text"
                  value={newCircle.members}
                  onChange={(e) => setNewCircle({ ...newCircle, members: e.target.value })}
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <button className="btn-create">Create Quality Circle</button>
            </div>
          </div>
        )}

        {activeTab === 'improvement' && (
          <div className="improvement-section">
            <h2>Continuous Improvement Projects</h2>
            <p className="section-desc">
              Track PDCA, DMAIC, and Kaizen improvement projects
            </p>
            <div className="improvement-links">
              <div className="link-card">
                <h3>PDCA Projects</h3>
                <p>Plan-Do-Check-Act improvement cycles</p>
                <a href="/improvement/pdca" className="btn-link">View PDCA Projects →</a>
              </div>
              <div className="link-card">
                <h3>DMAIC Projects</h3>
                <p>Six Sigma Define-Measure-Analyze-Improve-Control</p>
                <a href="/improvement/dmaic" className="btn-link">View DMAIC Projects →</a>
              </div>
              <div className="link-card">
                <h3>Kaizen Events</h3>
                <p>Continuous small improvements</p>
                <a href="/improvement/kaizen" className="btn-link">View Kaizen Board →</a>
              </div>
            </div>
          </div>
        )}

        {/* Implementation-focused: remove structure section */}
      </div>
    </div>
  );
}

