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
  const [verifyingId, setVerifyingId] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [verifierName, setVerifierName] = useState('');
  const [verificationCriteria, setVerificationCriteria] = useState(null);
  const [skipValidation, setSkipValidation] = useState(false);

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

  const handleVerify = async (sample) => {
    setSelectedSample(sample);
    setVerifierName(sample.verifiedBy || '');
    setSkipValidation(false);
    
    // Fetch verification criteria
    try {
      const res = await API.get(`/samples/${sample._id}/verification-criteria`);
      setVerificationCriteria(res.data);
    } catch (err) {
      console.error('Error fetching verification criteria:', err);
      setVerificationCriteria(null);
    }
    
    setShowVerifyModal(true);
  };

  const confirmVerify = async () => {
    if (!selectedSample) return;
    
    setVerifyingId(selectedSample._id);
    try {
      const response = await API.patch(`/samples/${selectedSample._id}/verify`, {
        verified: !selectedSample.verified,
        verifiedBy: verifierName || 'Quality Auditor',
        skipValidation: skipValidation
      });
      
      // Refresh samples
      await fetchSamples();
      setShowVerifyModal(false);
      setSelectedSample(null);
      setVerifierName('');
      setVerificationCriteria(null);
      setSkipValidation(false);
    } catch (err) {
      console.error('Error verifying sample:', err);
      if (err.response?.data?.criteria) {
        setVerificationCriteria(err.response.data.criteria);
        alert('Verification failed: ' + (err.response.data.message || err.response.data.error));
      } else {
        alert('Error verifying sample: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Location', 'Date', 'pH', 'TDS', 'Turbidity', 'Chlorine', 'Temperature', 'Quality Index', 'Status', 'Verified', 'Verified By', 'Verified At', 'Notes'];
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
      s.verifiedBy || 'N/A',
      s.verifiedAt ? new Date(s.verifiedAt).toLocaleString() : 'N/A',
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
                  <th>Verified By</th>
                  <th>Verified At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {samples.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="no-data">No samples found</td>
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
                      <td>
                        <span className={sample.verified ? 'verified-yes' : 'verified-no'}>
                          {sample.verified ? '✓ Verified' : '✗ Not Verified'}
                        </span>
                      </td>
                      <td>{sample.verifiedBy || '-'}</td>
                      <td>{sample.verifiedAt ? new Date(sample.verifiedAt).toLocaleString() : '-'}</td>
                      <td>
                        <button
                          onClick={() => handleVerify(sample)}
                          className="btn-verify"
                          disabled={verifyingId === sample._id}
                        >
                          {sample.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Verification Modal */}
      {showVerifyModal && selectedSample && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedSample.verified ? 'Unverify' : 'Verify'} Sample</h3>
            <div className="modal-body">
              <div className="sample-info">
                <p><strong>Location:</strong> {selectedSample.location}</p>
                <p><strong>Date:</strong> {new Date(selectedSample.timestamp).toLocaleString()}</p>
                <p><strong>Quality Index:</strong> {selectedSample.qualityIndex}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${selectedSample.status.toLowerCase()}`}>{selectedSample.status}</span></p>
                <p><strong>Compliance:</strong> {selectedSample.compliance?.isCompliant ? '✓ Compliant' : '✗ Non-Compliant'}</p>
              </div>

              {/* Verification Criteria */}
              {verificationCriteria && (
                <div className="verification-criteria">
                  <h4>Verification Criteria</h4>
                  
                  {/* Parameter Checks */}
                  {verificationCriteria.parameterChecks && (
                    <div className="param-checks">
                      <strong>Parameter Standards (WHO/BIS):</strong>
                      <table className="criteria-table">
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                            <th>Standard</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verificationCriteria.parameterChecks.map((check, idx) => (
                            <tr key={idx}>
                              <td>{check.param}</td>
                              <td>{check.value}</td>
                              <td>{check.limit}</td>
                              <td>
                                <span className={`param-status param-${check.status}`}>
                                  {check.status === 'pass' ? '✓ Pass' : 
                                   check.status === 'warning' ? '⚠ Warning' : '✗ Fail'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Reasons */}
                  {verificationCriteria.reasons && verificationCriteria.reasons.length > 0 && (
                    <div className="criteria-reasons">
                      <strong>✓ Meets Criteria:</strong>
                      <ul>
                        {verificationCriteria.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {verificationCriteria.warnings && verificationCriteria.warnings.length > 0 && (
                    <div className="criteria-warnings">
                      <strong>⚠ Warnings:</strong>
                      <ul>
                        {verificationCriteria.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {verificationCriteria.requirements && verificationCriteria.requirements.length > 0 && (
                    <div className="criteria-requirements">
                      <strong>📋 Requirements:</strong>
                      <ul>
                        {verificationCriteria.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Auto-verify Status */}
                  <div className={`auto-verify-status ${verificationCriteria.canAutoVerify ? 'can-verify' : 'cannot-verify'}`}>
                    {verificationCriteria.canAutoVerify ? (
                      <span>✓ Sample meets all criteria for verification</span>
                    ) : (
                      <span>✗ Sample does not meet verification criteria</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="verifier-name">Verifier Name:</label>
                <input
                  id="verifier-name"
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="Enter verifier name"
                  className="form-input"
                  required
                />
              </div>

              {verificationCriteria && !verificationCriteria.canAutoVerify && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={skipValidation}
                      onChange={(e) => setSkipValidation(e.target.checked)}
                    />
                    Skip validation (override criteria)
                  </label>
                  <small className="skip-warning">⚠ Only use if you have reviewed all warnings and determined verification is appropriate</small>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  onClick={confirmVerify}
                  className="btn-confirm"
                  disabled={verifyingId === selectedSample._id || (!verifierName && !selectedSample.verified)}
                >
                  {verifyingId === selectedSample._id ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedSample(null);
                    setVerifierName('');
                    setVerificationCriteria(null);
                    setSkipValidation(false);
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

