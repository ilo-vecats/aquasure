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
      temperature: body.temperature ? parseFloat(body.temperature) : undefined,
      compliance: {
        isCompliant: true,
        nonCompliantParams: [],
        deviationSeverity: 'none'
      }
    });
    
    // Check compliance before saving
    sample.compliance.nonCompliantParams = [];
    
    // pH check
    if (sample.ph < 6.5 || sample.ph > 8.5) {
      sample.compliance.nonCompliantParams.push('pH');
    }
    
    // TDS check
    if (sample.tds > 500) {
      sample.compliance.nonCompliantParams.push('TDS');
    }
    
    // Turbidity check
    if (sample.turbidity > 5) {
      sample.compliance.nonCompliantParams.push('Turbidity');
    }
    
    // Chlorine check
    if (sample.chlorine < 0.2 || sample.chlorine > 1.0) {
      sample.compliance.nonCompliantParams.push('Chlorine');
    }
    
    // Set compliance status
    sample.compliance.isCompliant = sample.compliance.nonCompliantParams.length === 0;
    
    // Set deviation severity
    if (sample.compliance.nonCompliantParams.length === 0) {
      sample.compliance.deviationSeverity = 'none';
    } else if (sample.compliance.nonCompliantParams.length > 2) {
      sample.compliance.deviationSeverity = 'major';
    } else {
      sample.compliance.deviationSeverity = 'minor';
    }
    
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

// Get verification criteria for a sample (TQM: Process controls)
function getVerificationCriteria(sample) {
  const criteria = {
    canAutoVerify: false,
    reasons: [],
    warnings: [],
    requirements: []
  };

  // Criteria 1: Compliance Status
  if (sample.compliance && sample.compliance.isCompliant) {
    criteria.reasons.push('Sample is compliant with all quality standards');
    criteria.canAutoVerify = true;
  } else {
    criteria.warnings.push('Sample has non-compliant parameters: ' + 
      (sample.compliance?.nonCompliantParams?.join(', ') || 'Unknown'));
    criteria.requirements.push('Review non-compliant parameters before verification');
  }

  // Criteria 2: Quality Index Threshold
  if (sample.qualityIndex >= 80) {
    criteria.reasons.push('Quality Index ≥ 80 (Safe range)');
    if (criteria.canAutoVerify) {
      criteria.canAutoVerify = true;
    }
  } else if (sample.qualityIndex >= 50) {
    criteria.warnings.push('Quality Index is borderline (50-79)');
    criteria.requirements.push('Manual review recommended for borderline samples');
  } else {
    criteria.warnings.push('Quality Index < 50 (Unsafe)');
    criteria.requirements.push('Mandatory manual review required for unsafe samples');
    criteria.canAutoVerify = false;
  }

  // Criteria 3: Status Check
  if (sample.status === 'Safe') {
    criteria.reasons.push('Status: Safe');
  } else if (sample.status === 'Borderline') {
    criteria.warnings.push('Status: Borderline - requires review');
    criteria.requirements.push('Verify all parameters are within acceptable limits');
  } else if (sample.status === 'Unsafe') {
    criteria.warnings.push('Status: Unsafe - cannot auto-verify');
    criteria.requirements.push('Corrective actions must be taken before verification');
    criteria.canAutoVerify = false;
  }

  // Criteria 4: Parameter Limits (WHO/BIS Standards)
  const paramChecks = [];
  
  // pH: 6.5-8.5
  if (sample.ph >= 6.5 && sample.ph <= 8.5) {
    paramChecks.push({ param: 'pH', status: 'pass', value: sample.ph, limit: '6.5-8.5' });
  } else {
    paramChecks.push({ param: 'pH', status: 'fail', value: sample.ph, limit: '6.5-8.5' });
    criteria.warnings.push(`pH (${sample.ph}) outside acceptable range (6.5-8.5)`);
  }

  // TDS: < 500 mg/L
  if (sample.tds <= 500) {
    paramChecks.push({ param: 'TDS', status: 'pass', value: sample.tds, limit: '< 500 mg/L' });
  } else {
    paramChecks.push({ param: 'TDS', status: 'fail', value: sample.tds, limit: '< 500 mg/L' });
    criteria.warnings.push(`TDS (${sample.tds} mg/L) exceeds limit (500 mg/L)`);
  }

  // Turbidity: < 5 NTU (acceptable), < 1 NTU (ideal)
  if (sample.turbidity <= 1) {
    paramChecks.push({ param: 'Turbidity', status: 'pass', value: sample.turbidity, limit: '< 1 NTU (ideal)' });
  } else if (sample.turbidity <= 5) {
    paramChecks.push({ param: 'Turbidity', status: 'warning', value: sample.turbidity, limit: '< 5 NTU (acceptable)' });
    criteria.warnings.push(`Turbidity (${sample.turbidity} NTU) above ideal but acceptable`);
  } else {
    paramChecks.push({ param: 'Turbidity', status: 'fail', value: sample.turbidity, limit: '< 5 NTU' });
    criteria.warnings.push(`Turbidity (${sample.turbidity} NTU) exceeds acceptable limit`);
  }

  // Chlorine: 0.2-1.0 mg/L
  if (sample.chlorine >= 0.2 && sample.chlorine <= 1.0) {
    paramChecks.push({ param: 'Chlorine', status: 'pass', value: sample.chlorine, limit: '0.2-1.0 mg/L' });
  } else {
    paramChecks.push({ param: 'Chlorine', status: 'fail', value: sample.chlorine, limit: '0.2-1.0 mg/L' });
    criteria.warnings.push(`Chlorine (${sample.chlorine} mg/L) outside acceptable range (0.2-1.0)`);
  }

  criteria.parameterChecks = paramChecks;

  // Final determination
  const allParamsPass = paramChecks.every(p => p.status === 'pass');
  if (!allParamsPass) {
    criteria.canAutoVerify = false;
  }

  return criteria;
}

// Verify sample (TQM: Audit trail)
exports.verifySample = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verifiedBy, skipValidation } = req.body;
    
    const sample = await Sample.findById(id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Get verification criteria
    const criteria = getVerificationCriteria(sample);
    
    // If verifying and not skipping validation, check criteria
    if (verified && !skipValidation && !criteria.canAutoVerify) {
      return res.status(400).json({ 
        error: 'Sample does not meet verification criteria',
        criteria: criteria,
        message: 'Sample has warnings or requirements that must be addressed before verification'
      });
    }
    
    const update = {
      verified: verified || false,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? verifiedBy : null
    };
    
    const updatedSample = await Sample.findByIdAndUpdate(id, update, { new: true });
    
    res.json({
      ...updatedSample.toObject(),
      verificationCriteria: criteria
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get verification criteria for a sample
exports.getVerificationCriteria = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    const criteria = getVerificationCriteria(sample);
    res.json(criteria);
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

