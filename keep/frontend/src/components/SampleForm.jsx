import React, { useState } from 'react';
import API from '../api';
import './SampleForm.css';

export default function SampleForm({ onAdded }) {
  const [form, setForm] = useState({
    location: '',
    ph: 7,
    tds: 100,
    turbidity: 1,
    chlorine: 0.3,
    temperature: 25,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs (TQM: Process control)
      if (form.ph < 0 || form.ph > 14) {
        throw new Error('pH must be between 0 and 14');
      }
      if (form.tds < 0) {
        throw new Error('TDS cannot be negative');
      }
      if (form.turbidity < 0) {
        throw new Error('Turbidity cannot be negative');
      }
      if (form.chlorine < 0) {
        throw new Error('Chlorine cannot be negative');
      }

      const res = await API.post('/samples', {
        ...form,
        ph: parseFloat(form.ph),
        tds: parseFloat(form.tds),
        turbidity: parseFloat(form.turbidity),
        chlorine: parseFloat(form.chlorine),
        temperature: form.temperature ? parseFloat(form.temperature) : undefined
      });

      setSuccess(true);
      setForm({
        location: '',
        ph: 7,
        tds: 100,
        turbidity: 1,
        chlorine: 0.3,
        temperature: 25,
        notes: ''
      });

      if (onAdded) {
        onAdded(res.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sample-form-container">
      <h2>Submit Water Quality Sample</h2>
      <p className="form-description">
        Enter water quality parameters following TQM data collection standards
      </p>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Sample submitted successfully!</div>}

      <form onSubmit={handleSubmit} className="sample-form">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Building A, Zone 1"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ph">pH Level *</label>
            <input
              id="ph"
              name="ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={form.ph}
              onChange={handleChange}
              required
            />
            <small>Ideal range: 6.5 - 8.5</small>
          </div>

          <div className="form-group">
            <label htmlFor="tds">TDS (mg/L) *</label>
            <input
              id="tds"
              name="tds"
              type="number"
              min="0"
              value={form.tds}
              onChange={handleChange}
              required
            />
            <small>Ideal: &lt; 500 mg/L</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="turbidity">Turbidity (NTU) *</label>
            <input
              id="turbidity"
              name="turbidity"
              type="number"
              step="0.1"
              min="0"
              value={form.turbidity}
              onChange={handleChange}
              required
            />
            <small>Ideal: &lt; 1 NTU</small>
          </div>

          <div className="form-group">
            <label htmlFor="chlorine">Residual Chlorine (mg/L) *</label>
            <input
              id="chlorine"
              name="chlorine"
              type="number"
              step="0.01"
              min="0"
              value={form.chlorine}
              onChange={handleChange}
              required
            />
            <small>Ideal: 0.2 - 0.5 mg/L</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="temperature">Temperature (°C)</label>
          <input
            id="temperature"
            name="temperature"
            type="number"
            step="0.1"
            value={form.temperature}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Additional observations or comments..."
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Sample'}
        </button>
      </form>
    </div>
  );
}

