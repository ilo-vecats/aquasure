const Sample = require('../models/Sample');
const Location = require('../models/Location');

// Compute Quality Index based on TQM standards
// This implements a data-driven decision making approach (TQM principle)
function computeQualityIndex({ ph, tds, turbidity, chlorine }) {
  // Ideal ranges based on WHO/EPA standards:
  // pH: 6.5-8.5 (ideal ~7)
  // TDS: < 500 mg/L
  // Turbidity: < 1 NTU (Nephelometric Turbidity Units)
  // Chlorine: 0.2-0.5 mg/L (residual chlorine)
  
  let score = 100;
  
  // pH penalty (ideal: 7, acceptable: 6.5-8.5)
  if (ph < 6.5 || ph > 8.5) {
    score -= Math.abs(ph - 7) * 8; // Higher penalty outside acceptable range
  } else {
    score -= Math.abs(ph - 7) * 3; // Lower penalty within acceptable range
  }
  
  // TDS penalty (ideal: < 500)
  if (tds > 500) {
    score -= (tds - 500) / 10; // 0.1 point per unit above 500
  }
  if (tds > 1000) {
    score -= 20; // Additional penalty for very high TDS
  }
  
  // Turbidity penalty (ideal: < 1 NTU)
  if (turbidity > 1) {
    score -= (turbidity - 1) * 5; // 5 points per unit above 1
  }
  if (turbidity > 5) {
    score -= 15; // Additional penalty for very high turbidity
  }
  
  // Chlorine penalty (ideal: 0.2-0.5 mg/L)
  if (chlorine < 0.2) {
    score -= (0.2 - chlorine) * 50; // High penalty for insufficient chlorine
  } else if (chlorine > 1.0) {
    score -= (chlorine - 1.0) * 30; // Penalty for excessive chlorine
  } else if (chlorine > 0.5) {
    score -= (chlorine - 0.5) * 10; // Moderate penalty above ideal
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

// Create new sample (TQM: Data collection process)
exports.createSample = async (req, res) => {
  try {
    const body = req.body;
    
    // Validate required fields
    if (!body.location || body.ph === undefined || body.tds === undefined || 
        body.turbidity === undefined || body.chlorine === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Compute quality index (TQM: Data-driven decision making)
    const qualityIndex = computeQualityIndex(body);
    
    // Determine status based on quality index (TQM: Process control)
    let status = 'Borderline';
    if (qualityIndex >= 80) {
      status = 'Safe';
    } else if (qualityIndex < 50) {
      status = 'Unsafe';
    }
    
    const sample = new Sample({
      ...body,
      qualityIndex,
      status,
      ph: parseFloat(body.ph),
      tds: parseFloat(body.tds),
      turbidity: parseFloat(body.turbidity),
      chlorine: parseFloat(body.chlorine),
      temperature: body.temperature ? parseFloat(body.temperature) : undefined
    });
    
    await sample.save();
    
    // Update location statistics (TQM: Continuous monitoring)
    await Location.findOneAndUpdate(
      { name: body.location },
      { 
        lastSampleDate: new Date(),
        $setOnInsert: { name: body.location }
      },
      { upsert: true, new: true }
    );
    
    res.status(201).json(sample);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all samples with optional filters
exports.getSamples = async (req, res) => {
  try {
    const { location, status, startDate, endDate, limit = 1000 } = req.query;
    
    const filter = {};
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(samples);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sample by ID
exports.getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json(sample);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update sample (for corrections/audits)
exports.updateSample = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Recalculate quality index if parameters changed
    if (updates.ph !== undefined || updates.tds !== undefined || 
        updates.turbidity !== undefined || updates.chlorine !== undefined) {
      const sample = await Sample.findById(id);
      if (!sample) {
        return res.status(404).json({ error: 'Sample not found' });
      }
      
      const qualityIndex = computeQualityIndex({
        ph: updates.ph !== undefined ? updates.ph : sample.ph,
        tds: updates.tds !== undefined ? updates.tds : sample.tds,
        turbidity: updates.turbidity !== undefined ? updates.turbidity : sample.turbidity,
        chlorine: updates.chlorine !== undefined ? updates.chlorine : sample.chlorine
      });
      
      let status = 'Borderline';
      if (qualityIndex >= 80) status = 'Safe';
      else if (qualityIndex < 50) status = 'Unsafe';
      
      updates.qualityIndex = qualityIndex;
      updates.status = status;
    }
    
    const sample = await Sample.findByIdAndUpdate(id, updates, { new: true });
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    res.json(sample);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify sample (TQM: Audit trail)
exports.verifySample = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verifiedBy } = req.body;
    
    const update = {
      verified: verified || false,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? verifiedBy : null
    };
    
    const sample = await Sample.findByIdAndUpdate(id, update, { new: true });
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    res.json(sample);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add corrective action (TQM: Corrective action log)
exports.addCorrectiveAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, assignedTo, dueDate } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action description is required' });
    }
    
    const sample = await Sample.findById(id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    sample.correctiveActions.push({
      action,
      assignedTo: assignedTo || 'Unassigned',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'Pending'
    });
    
    await sample.save();
    res.json(sample);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get statistics for dashboard (TQM: Control charts data)
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter);
    
    const stats = {
      total: samples.length,
      safe: samples.filter(s => s.status === 'Safe').length,
      borderline: samples.filter(s => s.status === 'Borderline').length,
      unsafe: samples.filter(s => s.status === 'Unsafe').length,
      averageQualityIndex: samples.length > 0 
        ? (samples.reduce((sum, s) => sum + s.qualityIndex, 0) / samples.length).toFixed(2)
        : 0,
      averagePh: samples.length > 0
        ? (samples.reduce((sum, s) => sum + s.ph, 0) / samples.length).toFixed(2)
        : 0,
      averageTds: samples.length > 0
        ? (samples.reduce((sum, s) => sum + s.tds, 0) / samples.length).toFixed(2)
        : 0
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete sample
exports.deleteSample = async (req, res) => {
  try {
    const sample = await Sample.findByIdAndDelete(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json({ message: 'Sample deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

