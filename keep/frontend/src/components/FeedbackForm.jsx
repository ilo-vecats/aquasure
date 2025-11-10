import React, { useState } from 'react';
import API from '../api';
import './FeedbackForm.css';

export default function FeedbackForm() {
  const [form, setForm] = useState({
    customerName: '',
    organization: '',
    location: '',
    contactEmail: '',
    satisfactionScore: 4,
    qualityFocus: 'Water Quality',
    feedbackType: 'Suggestion',
    comment: '',
    improvementSuggestion: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      await API.post('/feedback', {
        ...form,
        satisfactionScore: Number(form.satisfactionScore)
      });
      setSuccess('Thank you! Your feedback has been submitted.');
      setForm({
        customerName: '',
        organization: '',
        location: '',
        contactEmail: '',
        satisfactionScore: 4,
        qualityFocus: 'Water Quality',
        feedbackType: 'Suggestion',
        comment: '',
        improvementSuggestion: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-container">
      <h2>Customer Feedback</h2>
      <p className="feedback-description">
        TQM Unit 1 • Customer Focus • Your feedback helps us continuously improve quality and service.
      </p>

      {success && <div className="feedback-success">{success}</div>}
      {error && <div className="feedback-error">{error}</div>}

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer Name</label>
            <input name="customerName" value={form.customerName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input name="organization" value={form.organization} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" />
          </div>
          <div className="form-group">
            <label>Satisfaction (1-5)</label>
            <input name="satisfactionScore" value={form.satisfactionScore} onChange={handleChange} type="number" min="1" max="5" />
          </div>
          <div className="form-group">
            <label>Quality Focus</label>
            <select name="qualityFocus" value={form.qualityFocus} onChange={handleChange}>
              <option>Water Quality</option>
              <option>Service</option>
              <option>Timeliness</option>
              <option>Communication</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Feedback Type</label>
            <select name="feedbackType" value={form.feedbackType} onChange={handleChange}>
              <option>Complaint</option>
              <option>Compliment</option>
              <option>Suggestion</option>
              <option>Improvement</option>
            </select>
          </div>
          <div className="form-group form-group-full">
            <label>Comments</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} rows="3" />
          </div>
          <div className="form-group form-group-full">
            <label>Improvement Suggestion</label>
            <textarea name="improvementSuggestion" value={form.improvementSuggestion} onChange={handleChange} rows="2" />
          </div>
        </div>
        <button className="btn-submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

