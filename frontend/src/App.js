import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SampleForm from './components/SampleForm';
import Reports from './components/Reports';
// import SPCCharts from './components/SPCCharts';
import FeedbackForm from './components/FeedbackForm';
import QCTools from './components/QCTools';
import PredictiveMonitoring from './components/PredictiveMonitoring';
// import TQMFramework from './components/TQMFramework';
// import ImprovementProjects from './components/ImprovementProjects';
// import ProcessCapability from './components/ProcessCapability';
import QMSDashboard from './components/QMSDashboard';
import EMSDashboard from './components/EMSDashboard';
import API from './api';
import './App.css';

function App() {
  const [samples, setSamples] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSampleAdded = (newSample) => {
    setSamples([newSample, ...samples]);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <h1>AquaSure</h1>
              <span className="nav-subtitle">Drinking Water Quality Check</span>
            </Link>
                <div className="nav-links">
                  <Link to="/">Dashboard</Link>
                  <Link to="/submit">Submit Sample</Link>
                  {/* <Link to="/tqm-framework">TQM Framework</Link> */}
                  <Link to="/feedback">Feedback</Link>
                  {/* <Link to="/improvement/pdca">Improvement</Link> */}
                  <Link to="/qc-tools">QC Tools</Link>
                  {/* <Link to="/process-capability">Process Capability</Link> */}
                  <Link to="/qms">QMS (ISO 9001)</Link>
                  <Link to="/ems">EMS (ISO 14001)</Link>
                  <Link to="/reports">Reports</Link>
                </div>
          </div>
        </nav>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard key={refreshKey} />} />
                <Route
                  path="/submit"
                  element={<SampleForm onAdded={handleSampleAdded} />}
                />
                {/* <Route path="/spc" element={<SPCCharts />} /> */}
                {/* <Route path="/tqm-framework" element={<TQMFramework />} /> */}
                <Route path="/feedback" element={<FeedbackForm />} />
                {/* <Route path="/improvement/:type" element={<ImprovementProjects />} /> */}
                <Route path="/qc-tools" element={<QCTools />} />
                {/* <Route path="/process-capability" element={<ProcessCapability />} /> */}
                <Route path="/qms" element={<QMSDashboard />} />
                <Route path="/ems" element={<EMSDashboard />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </main>

      </div>
    </Router>
  );
}

export default App;

