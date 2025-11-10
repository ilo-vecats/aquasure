import React from 'react';
import './TQMFramework.css';

export default function TQMFramework() {
  const qualityGurus = [
    {
      name: 'W. Edwards Deming',
      contribution: '14 Points for Management, PDCA Cycle, System of Profound Knowledge',
      keyPrinciples: ['Continuous Improvement', 'Management Responsibility', 'Eliminate Fear', 'Drive Out Fear']
    },
    {
      name: 'Joseph M. Juran',
      contribution: 'Juran Trilogy (Planning, Control, Improvement), Quality Planning',
      keyPrinciples: ['Quality Planning', 'Quality Control', 'Quality Improvement', 'Pareto Principle']
    },
    {
      name: 'Philip B. Crosby',
      contribution: 'Zero Defects, Quality is Free, 4 Absolutes of Quality',
      keyPrinciples: ['Zero Defects', 'Prevention over Inspection', 'Quality is Free', 'Do It Right First Time']
    },
    {
      name: 'Kaoru Ishikawa',
      contribution: '7 QC Tools, Cause-Effect Diagram, Quality Circles',
      keyPrinciples: ['7 QC Tools', 'Cause-Effect Analysis', 'Quality Circles', 'Company-Wide Quality Control']
    }
  ];

  const tqmPrinciples = [
    {
      principle: 'Customer Focus',
      description: 'Understanding and meeting customer requirements and expectations',
      implementation: 'Customer feedback system, satisfaction surveys, complaint management'
    },
    {
      principle: 'Leadership',
      description: 'Top management commitment and involvement in quality initiatives',
      implementation: 'Quality policy, management review, resource allocation'
    },
    {
      principle: 'Engagement of People',
      description: 'Empowering employees at all levels to contribute to quality',
      implementation: 'Quality circles, employee training, recognition programs'
    },
    {
      principle: 'Process Approach',
      description: 'Managing activities as interconnected processes',
      implementation: 'Process mapping, SIPOC diagrams, process controls'
    },
    {
      principle: 'Improvement',
      description: 'Continuous improvement through PDCA, DMAIC, Kaizen',
      implementation: 'PDCA projects, DMAIC projects, Kaizen events'
    },
    {
      principle: 'Evidence-Based Decision Making',
      description: 'Making decisions based on data and analysis',
      implementation: 'SPC charts, QC tools, statistical analysis'
    },
    {
      principle: 'Relationship Management',
      description: 'Managing relationships with suppliers and stakeholders',
      implementation: 'Supplier evaluation, partnership development, procurement control'
    }
  ];

  const qualityEvolution = [
    { era: '1920s-1940s', stage: 'Quality Inspection', description: 'Inspection of finished products, detection of defects' },
    { era: '1950s-1960s', stage: 'Quality Control', description: 'Statistical methods, control charts, process monitoring' },
    { era: '1970s-1980s', stage: 'Quality Assurance', description: 'Prevention focus, quality systems, standards (ISO 9000)' },
    { era: '1990s-Present', stage: 'Total Quality Management', description: 'Company-wide approach, continuous improvement, customer focus' }
  ];

  return (
    <div className="tqm-framework-container">
      <div className="tqm-header">
        <h1>TQM Framework & Quality Concepts</h1>
        <p className="tqm-subtitle">Unit 1: Introduction to Total Quality Management</p>
      </div>

      {/* Quality Gurus Section */}
      <section className="gurus-section">
        <h2>Quality Gurus & Their Contributions</h2>
        <div className="gurus-grid">
          {qualityGurus.map((guru, idx) => (
            <div key={idx} className="guru-card">
              <h3>{guru.name}</h3>
              <p className="guru-contribution">{guru.contribution}</p>
              <div className="guru-principles">
                <strong>Key Principles:</strong>
                <ul>
                  {guru.keyPrinciples.map((principle, pIdx) => (
                    <li key={pIdx}>{principle}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TQM Principles Section */}
      <section className="principles-section">
        <h2>7 Core TQM Principles (ISO 9001:2015)</h2>
        <div className="principles-grid">
          {tqmPrinciples.map((principle, idx) => (
            <div key={idx} className="principle-card">
              <div className="principle-number">{idx + 1}</div>
              <h3>{principle.principle}</h3>
              <p className="principle-description">{principle.description}</p>
              <div className="principle-implementation">
                <strong>Implementation in AquaSure:</strong>
                <p>{principle.implementation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Evolution Timeline */}
      <section className="evolution-section">
        <h2>Evolution of Quality Management</h2>
        <div className="timeline">
          {qualityEvolution.map((stage, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-marker">{idx + 1}</div>
              <div className="timeline-content">
                <div className="timeline-era">{stage.era}</div>
                <h3>{stage.stage}</h3>
                <p>{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TQM Benefits Section */}
      <section className="benefits-section">
        <h2>Benefits of TQM Implementation</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>📈 Improved Quality</h3>
            <p>Reduced defects, higher customer satisfaction, better product consistency</p>
          </div>
          <div className="benefit-card">
            <h3>💰 Cost Reduction</h3>
            <p>Lower rework costs, reduced waste, improved efficiency</p>
          </div>
          <div className="benefit-card">
            <h3>👥 Employee Engagement</h3>
            <p>Higher morale, better teamwork, increased ownership</p>
          </div>
          <div className="benefit-card">
            <h3>🎯 Customer Satisfaction</h3>
            <p>Better understanding of customer needs, improved service delivery</p>
          </div>
          <div className="benefit-card">
            <h3>🔄 Continuous Improvement</h3>
            <p>Systematic problem-solving, innovation, process optimization</p>
          </div>
          <div className="benefit-card">
            <h3>📊 Data-Driven Decisions</h3>
            <p>Evidence-based management, better forecasting, risk reduction</p>
          </div>
        </div>
      </section>

      {/* TQM in AquaSure Section */}
      <section className="aquasure-tqm-section">
        <h2>TQM Implementation in AquaSure</h2>
        <div className="implementation-map">
          <div className="impl-item">
            <strong>Customer Focus:</strong> Customer feedback system, satisfaction tracking
          </div>
          <div className="impl-item">
            <strong>Process Control:</strong> SPC charts, QC tools, process monitoring
          </div>
          <div className="impl-item">
            <strong>Continuous Improvement:</strong> PDCA projects, DMAIC methodology, Kaizen
          </div>
          <div className="impl-item">
            <strong>Data-Driven:</strong> Quality index calculation, statistical analysis, predictive monitoring
          </div>
          <div className="impl-item">
            <strong>Supplier Management:</strong> Supplier evaluation, procurement control, partnership
          </div>
          <div className="impl-item">
            <strong>Quality Systems:</strong> ISO 9001/14001 compliance, audits, CAPA
          </div>
        </div>
      </section>
    </div>
  );
}

