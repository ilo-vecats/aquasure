import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SampleForm from './components/SampleForm';
import Reports from './components/Reports';
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
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;

