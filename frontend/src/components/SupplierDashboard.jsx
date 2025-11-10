import React, { useEffect, useState } from 'react';
import API from '../api';
import './SupplierDashboard.css';

export default function SupplierDashboard() {
  const [summary, setSummary] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, suppliersRes] = await Promise.all([
          API.get('/suppliers/dashboard'),
          API.get('/suppliers')
        ]);
        setSummary(summaryRes.data);
        setSuppliers(suppliersRes.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load supplier dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = status => {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Conditional':
        return 'status-conditional';
      case 'Under Review':
        return 'status-review';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="supplier-dashboard-container">
      <div className="supplier-header">
        <h2>Supplier Quality Dashboard</h2>
        <p className="supplier-description">
          TQM Unit 1 • Customer-Supplier Partnership • Supplier evaluation, capacity verification, and certification tracking.
        </p>
      </div>

      {loading ? (
        <div className="supplier-loading">Loading supplier insights...</div>
      ) : error ? (
        <div className="supplier-error">{error}</div>
      ) : summary ? (
        <>
          <div className="supplier-metrics">
            <div className="metric-card">
              <div className="metric-label">Total Suppliers</div>
              <div className="metric-value">{summary.totalSuppliers}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Quality Rating</div>
              <div className="metric-value">{summary.averageRatings?.quality ?? 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">ISO 9001 Certified</div>
              <div className="metric-value">{summary.certificationCoverage?.iso9001 ?? 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Open Improvement Actions</div>
              <div className="metric-value">
                {suppliers.filter(s => s.evaluation?.status === 'Conditional' || s.evaluation?.status === 'Under Review').length}
              </div>
            </div>
          </div>

          <div className="supplier-section">
            <h3>Status Breakdown</h3>
            <div className="status-grid">
              {summary.statusBreakdown?.map(item => (
                <div key={item.status} className={`status-card ${getStatusClass(item.status)}`}>
                  <div className="status-name">{item.status}</div>
                  <div className="status-count">{item.count} suppliers</div>
                  <div className="status-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="supplier-section">
            <h3>Top Performing Suppliers</h3>
            <div className="top-suppliers">
              {summary.topSuppliers?.map((supplier, index) => (
                <div key={supplier.id} className="top-supplier-card">
                  <div className="rank">#{index + 1}</div>
                  <div className="supplier-info">
                    <div className="supplier-name">{supplier.name}</div>
                    <div className="supplier-meta">
                      <span>{supplier.type}</span>
                      <span className={`status-chip ${getStatusClass(supplier.status)}`}>{supplier.status || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="supplier-rating">
                    <span className="rating-value">{supplier.overallRating?.toFixed(1) || 0}</span>
                    <span className="rating-label">Overall Rating</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="supplier-section">
            <h3>Supplier Performance Table</h3>
            <div className="supplier-table-wrapper">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Quality</th>
                    <th>Delivery</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => {
                    const criteria = supplier.evaluation?.evaluationCriteria || {};
                    return (
                      <tr key={supplier._id}>
                        <td>{supplier.name}</td>
                        <td>{supplier.type}</td>
                        <td>
                          <span className={`status-chip ${getStatusClass(supplier.evaluation?.status)}`}>
                            {supplier.evaluation?.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{criteria.quality ?? '-'}</td>
                        <td>{criteria.delivery ?? '-'}</td>
                        <td>{criteria.service ?? '-'}</td>
                        <td>{criteria.price ?? '-'}</td>
                        <td>{supplier.evaluation?.overallRating ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="supplier-error">No supplier data available yet.</div>
      )}
    </div>
  );
}

