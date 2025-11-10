import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import './ImprovementProjects.css';

export default function ImprovementProjects() {
  const { type } = useParams(); // 'pdca', 'dmaic', or 'kaizen'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [type]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (type === 'pdca') {
        const res = await API.get('/improvement/pdca');
        setProjects(res.data);
      } else if (type === 'dmaic') {
        const res = await API.get('/improvement/dmaic');
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Use sample data for demo
      setProjects(getSampleProjects());
    } finally {
      setLoading(false);
    }
  };

  const getSampleProjects = () => {
    if (type === 'pdca') {
      return [
        {
          _id: '1',
          projectId: 'PDCA-001',
          title: 'Improve pH Consistency',
          description: 'Reduce pH variation in distribution network',
          currentPhase: 'Do',
          status: 'Implementation',
          plan: {
            problemStatement: 'pH levels vary significantly across locations',
            target: 'Maintain pH between 7.0-7.5 at all locations',
            actionPlan: [
              { action: 'Review treatment process', status: 'Completed' },
              { action: 'Calibrate pH meters', status: 'In Progress' }
            ]
          }
        }
      ];
    } else if (type === 'dmaic') {
      return [
        {
          _id: '1',
          projectId: 'DMAIC-001',
          title: 'Reduce Non-Compliance Rate',
          description: 'Reduce non-compliant samples by 50%',
          currentPhase: 'Analyze',
          status: 'Analyze',
          define: {
            problemStatement: 'High non-compliance rate in TDS parameter',
            goal: 'Reduce non-compliance from 15% to 7.5%'
          }
        }
      ];
    }
    return [];
  };

  const renderPDCAProject = (project) => (
    <div key={project._id} className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className={`phase-badge phase-${project.currentPhase.toLowerCase()}`}>
          {project.currentPhase}
        </span>
      </div>
      <p className="project-desc">{project.description}</p>
      <div className="project-phases">
        <div className={`phase-item ${project.currentPhase === 'Plan' ? 'active' : ''}`}>
          <strong>Plan:</strong> {project.plan?.problemStatement || 'Not started'}
        </div>
        <div className={`phase-item ${project.currentPhase === 'Do' ? 'active' : ''}`}>
          <strong>Do:</strong> Implementation in progress
        </div>
        <div className={`phase-item ${project.currentPhase === 'Check' ? 'active' : ''}`}>
          <strong>Check:</strong> Results analysis
        </div>
        <div className={`phase-item ${project.currentPhase === 'Act' ? 'active' : ''}`}>
          <strong>Act:</strong> Standardization
        </div>
      </div>
      <button className="btn-view" onClick={() => setActiveProject(project)}>
        View Details
      </button>
    </div>
  );

  const renderDMAICProject = (project) => (
    <div key={project._id} className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className={`phase-badge phase-${project.currentPhase.toLowerCase()}`}>
          {project.currentPhase}
        </span>
      </div>
      <p className="project-desc">{project.description}</p>
      <div className="project-phases">
        <div className={`phase-item ${project.currentPhase === 'Define' ? 'active' : ''}`}>
          <strong>Define:</strong> {project.define?.problemStatement || 'Not started'}
        </div>
        <div className={`phase-item ${project.currentPhase === 'Measure' ? 'active' : ''}`}>
          <strong>Measure:</strong> Baseline data collection
        </div>
        <div className={`phase-item ${project.currentPhase === 'Analyze' ? 'active' : ''}`}>
          <strong>Analyze:</strong> Root cause analysis
        </div>
        <div className={`phase-item ${project.currentPhase === 'Improve' ? 'active' : ''}`}>
          <strong>Improve:</strong> Solution implementation
        </div>
        <div className={`phase-item ${project.currentPhase === 'Control' ? 'active' : ''}`}>
          <strong>Control:</strong> Sustain improvements
        </div>
      </div>
      <button className="btn-view" onClick={() => setActiveProject(project)}>
        View Details
      </button>
    </div>
  );

  const renderKaizenBoard = () => (
    <div className="kaizen-board">
      <h2>Kaizen Board - Continuous Small Improvements</h2>
      <div className="kaizen-columns">
        <div className="kaizen-column">
          <h3>💡 Ideas</h3>
          <div className="kaizen-item">
            <p>Improve sample collection form layout</p>
            <span className="kaizen-priority">Low</span>
          </div>
        </div>
        <div className="kaizen-column">
          <h3>🔄 In Progress</h3>
          <div className="kaizen-item">
            <p>Add tooltips to form fields</p>
            <span className="kaizen-priority">Medium</span>
          </div>
        </div>
        <div className="kaizen-column">
          <h3>✅ Completed</h3>
          <div className="kaizen-item">
            <p>Improve dashboard loading speed</p>
            <span className="kaizen-priority">High</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (type === 'kaizen') {
    return (
      <div className="improvement-projects-container">
        <div className="ip-header">
          <h1>Kaizen Board</h1>
          <p>Continuous Small Improvements</p>
        </div>
        {renderKaizenBoard()}
      </div>
    );
  }

  return (
    <div className="improvement-projects-container">
      <div className="ip-header">
        <h1>{type === 'pdca' ? 'PDCA Projects' : 'DMAIC Projects'}</h1>
        <p>{type === 'pdca' ? 'Plan-Do-Check-Act Improvement Cycles' : 'Six Sigma Define-Measure-Analyze-Improve-Control'}</p>
        <button className="btn-create-project" onClick={() => setShowForm(true)}>
          + Create New Project
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : (
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>No {type === 'pdca' ? 'PDCA' : 'DMAIC'} projects found.</p>
              <button className="btn-create" onClick={() => setShowForm(true)}>
                Create First Project
              </button>
            </div>
          ) : (
            projects.map(project => type === 'pdca' ? renderPDCAProject(project) : renderDMAICProject(project))
          )}
        </div>
      )}
    </div>
  );
}

