const Sample = require('../models/Sample');
const Prediction = require('../models/Prediction');
const Location = require('../models/Location');

// Calculate trend from historical data
function calculateTrend(samples, days = 30) {
  if (samples.length < 2) return null;
  
  const recentSamples = samples.slice(-days);
  const values = recentSamples.map(s => s.qualityIndex);
  
  // Simple linear regression
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept, trend: slope > 0 ? 'improving' : slope < 0 ? 'degrading' : 'stable' };
}

// Predict quality index for next N days
function predictQualityIndex(samples, daysAhead = 7) {
  if (samples.length < 7) return null;
  
  const trend = calculateTrend(samples);
  if (!trend) return null;
  
  const lastValue = samples[samples.length - 1].qualityIndex;
  const predictedValue = lastValue + (trend.slope * daysAhead);
  
  // Apply bounds
  const boundedValue = Math.max(0, Math.min(100, predictedValue));
  
  // Calculate confidence based on data consistency
  const recentValues = samples.slice(-7).map(s => s.qualityIndex);
  const variance = recentValues.reduce((sum, val) => {
    const mean = recentValues.reduce((a, b) => a + b) / recentValues.length;
    return sum + Math.pow(val - mean, 2);
  }, 0) / recentValues.length;
  const stdDev = Math.sqrt(variance);
  const confidence = Math.max(0, Math.min(100, 100 - (stdDev * 2))); // Lower variance = higher confidence
  
  return {
    predictedValue: Math.round(boundedValue),
    confidence: Math.round(confidence),
    trend: trend.trend,
    slope: trend.slope
  };
}

// Predict individual parameters
function predictParameters(samples, daysAhead = 7) {
  const predictions = {};
  const params = ['ph', 'tds', 'turbidity', 'chlorine'];
  
  params.forEach(param => {
    const values = samples.map(s => s[param]).filter(v => v !== undefined);
    if (values.length < 7) {
      predictions[param] = { value: null, confidence: 0 };
      return;
    }
    
    // Simple moving average with trend
    const recent = values.slice(-7);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = (recent[recent.length - 1] - recent[0]) / recent.length;
    const predicted = avg + (trend * daysAhead);
    
    // Calculate confidence
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(100, 100 - (stdDev * 5)));
    
    predictions[param] = {
      value: Math.round(predicted * 100) / 100,
      confidence: Math.round(confidence)
    };
  });
  
  return predictions;
}

// Calculate risk score
function calculateRiskScore(prediction, historicalData) {
  let riskScore = 0;
  const riskFactors = [];
  
  // Factor 1: Predicted quality index
  if (prediction.predictedQualityIndex < 50) {
    riskScore += 40;
    riskFactors.push({
      factor: 'Low Predicted Quality Index',
      impact: 40,
      description: `Predicted QI: ${prediction.predictedQualityIndex} (Unsafe range)`
    });
  } else if (prediction.predictedQualityIndex < 80) {
    riskScore += 20;
    riskFactors.push({
      factor: 'Moderate Predicted Quality Index',
      impact: 20,
      description: `Predicted QI: ${prediction.predictedQualityIndex} (Borderline range)`
    });
  }
  
  // Factor 2: Degrading trend
  if (prediction.trend === 'degrading') {
    riskScore += 25;
    riskFactors.push({
      factor: 'Degrading Quality Trend',
      impact: 25,
      description: 'Quality is trending downward'
    });
  }
  
  // Factor 3: Parameter violations
  const params = prediction.predictedParameters;
  if (params?.ph?.value !== null && params?.ph?.value !== undefined && (params.ph.value < 6.5 || params.ph.value > 8.5)) {
    riskScore += 15;
    riskFactors.push({
      factor: 'pH Out of Range',
      impact: 15,
      description: `Predicted pH: ${params.ph.value} (Standard: 6.5-8.5)`
    });
  }
  if (params?.tds?.value !== null && params?.tds?.value !== undefined && params.tds.value > 500) {
    riskScore += 15;
    riskFactors.push({
      factor: 'High TDS',
      impact: 15,
      description: `Predicted TDS: ${params.tds.value} mg/L (Limit: 500)`
    });
  }
  if (params?.turbidity?.value !== null && params?.turbidity?.value !== undefined && params.turbidity.value > 5) {
    riskScore += 15;
    riskFactors.push({
      factor: 'High Turbidity',
      impact: 15,
      description: `Predicted Turbidity: ${params.turbidity.value} NTU (Limit: 5)`
    });
  }
  if (params?.chlorine?.value !== null && params?.chlorine?.value !== undefined && (params.chlorine.value < 0.2 || params.chlorine.value > 1.0)) {
    riskScore += 15;
    riskFactors.push({
      factor: 'Chlorine Out of Range',
      impact: 15,
      description: `Predicted Chlorine: ${params.chlorine.value} mg/L (Range: 0.2-1.0)`
    });
  }
  
  // Factor 4: Historical issues at this location
  if (historicalData) {
    const recentIssues = historicalData.filter(s => 
      s.status === 'Unsafe' || !s.compliance?.isCompliant
    ).length;
    if (recentIssues > 3) {
      riskScore += 10;
      riskFactors.push({
        factor: 'History of Quality Issues',
        impact: 10,
        description: `${recentIssues} recent quality issues at this location`
      });
    }
  }
  
  // Determine risk level
  let riskLevel = 'Low';
  if (riskScore >= 70) riskLevel = 'Critical';
  else if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 30) riskLevel = 'Medium';
  
  return { riskScore: Math.min(100, riskScore), riskLevel, riskFactors };
}

// Generate recommended actions based on risk factors
function generateRecommendations(riskFactors, historicalData) {
  const recommendations = [];
  
  // Base recommendations on risk factors
  riskFactors.forEach(factor => {
    if (factor.factor.includes('pH')) {
      recommendations.push({
        action: 'Check and adjust pH treatment process',
        priority: factor.impact > 20 ? 'High' : 'Medium',
        category: 'Preventive',
        estimatedCost: 5000,
        estimatedImpact: 85,
        implementationTime: '2-4 hours',
        successProbability: 0.85,
        basedOn: 'Standard water treatment protocol'
      });
    }
    
    if (factor.factor.includes('TDS')) {
      recommendations.push({
        action: 'Review source water quality and filtration system',
        priority: factor.impact > 20 ? 'High' : 'Medium',
        category: 'Preventive',
        estimatedCost: 10000,
        estimatedImpact: 80,
        implementationTime: '1-2 days',
        successProbability: 0.75,
        basedOn: 'TDS reduction best practices'
      });
    }
    
    if (factor.factor.includes('Turbidity')) {
      recommendations.push({
        action: 'Increase filtration and coagulation treatment',
        priority: factor.impact > 20 ? 'High' : 'Medium',
        category: 'Preventive',
        estimatedCost: 8000,
        estimatedImpact: 90,
        implementationTime: '4-6 hours',
        successProbability: 0.80,
        basedOn: 'Turbidity control standards'
      });
    }
    
    if (factor.factor.includes('Chlorine')) {
      recommendations.push({
        action: 'Adjust chlorination dosage',
        priority: factor.impact > 20 ? 'High' : 'Medium',
        category: 'Preventive',
        estimatedCost: 2000,
        estimatedImpact: 95,
        implementationTime: '1-2 hours',
        successProbability: 0.90,
        basedOn: 'Chlorine residual management'
      });
    }
    
    if (factor.factor.includes('Trend')) {
      recommendations.push({
        action: 'Conduct root cause analysis and implement preventive measures',
        priority: 'High',
        category: 'Preventive',
        estimatedCost: 15000,
        estimatedImpact: 75,
        implementationTime: '3-5 days',
        successProbability: 0.70,
        basedOn: 'TQM continuous improvement principles'
      });
    }
  });
  
  // Add general recommendations based on risk level
  const totalRisk = riskFactors.reduce((sum, f) => sum + f.impact, 0);
  if (totalRisk >= 50) {
    recommendations.push({
      action: 'Increase sampling frequency for this location',
      priority: 'High',
      category: 'Monitoring',
      estimatedCost: 3000,
      estimatedImpact: 60,
      implementationTime: 'Immediate',
      successProbability: 0.95,
      basedOn: 'Risk-based sampling strategy'
    });
    
    recommendations.push({
      action: 'Notify stakeholders and prepare contingency plan',
      priority: 'Critical',
      category: 'Preventive',
      estimatedCost: 0,
      estimatedImpact: 50,
      implementationTime: 'Immediate',
      successProbability: 1.0,
      basedOn: 'Emergency response protocol'
    });
  }
  
  // Sort by priority and impact
  const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimatedImpact - a.estimatedImpact;
  });
  
  return recommendations;
}

// Generate prediction for a location
exports.generatePrediction = async (req, res) => {
  try {
    const { location, daysAhead = 7 } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    // Get historical samples for this location
    let samples = await Sample.find({ location })
      .sort({ timestamp: 1 })
      .limit(100);
    
    let dataSource = 'location';
    
    if (samples.length < 7) {
      // Fallback to global dataset if the specific location has limited history
      samples = await Sample.find()
        .sort({ timestamp: 1 })
        .limit(150);
      dataSource = 'global';
    }
    
    if (samples.length < 7) {
      return res.status(400).json({ 
        error: 'Insufficient historical data. Need at least 7 samples to generate a prediction.' 
      });
    }
    
    // Predict quality index
    const qiPrediction = predictQualityIndex(samples, parseInt(daysAhead));
    if (!qiPrediction) {
      return res.status(400).json({ error: 'Unable to generate prediction' });
    }
    
    // Predict parameters
    const paramPredictions = predictParameters(samples, parseInt(daysAhead));
    
    // Calculate risk
    const risk = calculateRiskScore({
      predictedQualityIndex: qiPrediction.predictedValue,
      predictedParameters: paramPredictions,
      trend: qiPrediction.trend
    }, samples);
    
    // Generate recommendations
    const recommendations = generateRecommendations(risk.riskFactors, samples);
    
    // Find similar historical patterns
    const similarIssues = samples
      .filter(s => s.status === 'Unsafe' || !s.compliance?.isCompliant)
      .slice(-5)
      .map(s => ({
        date: s.timestamp,
        location: s.location,
        issue: s.compliance?.nonCompliantParams?.join(', ') || 'Quality issue',
        resolution: s.correctiveActions?.[0]?.action || 'Not resolved',
        success: s.status === 'Safe'
      }));
    
    // Create prediction record
    const prediction = new Prediction({
      location,
      dataSource,
      predictionDate: new Date(Date.now() + parseInt(daysAhead) * 24 * 60 * 60 * 1000),
      predictedQualityIndex: qiPrediction.predictedValue,
      predictedParameters: paramPredictions,
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      riskFactors: risk.riskFactors,
      recommendedActions: recommendations,
      historicalPattern: {
        similarIssues,
        patternType: qiPrediction.trend,
        confidence: qiPrediction.confidence
      },
      status: risk.riskLevel === 'Critical' || risk.riskLevel === 'High' ? 'Active' : 'Active'
    });
    
    await prediction.save();
    
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get predictions for a location
exports.getPredictions = async (req, res) => {
  try {
    const { location, status, riskLevel } = req.query;
    const filter = {};
    
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    const predictions = await Prediction.find(filter)
      .sort({ predictionDate: 1 })
      .limit(50);
    
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get active high-risk predictions
exports.getActiveAlerts = async (req, res) => {
  try {
    const predictions = await Prediction.find({
      status: 'Active',
      riskLevel: { $in: ['High', 'Critical'] }
    })
      .sort({ riskScore: -1, predictionDate: 1 })
      .limit(20);
    
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update prediction with actual outcome
exports.updatePredictionOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualQualityIndex, actualParameters, actionsTaken, actionsEffective } = req.body;
    
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    // Calculate prediction accuracy
    const accuracy = actualQualityIndex !== undefined
      ? 100 - Math.abs(prediction.predictedQualityIndex - actualQualityIndex)
      : null;
    
    prediction.actualOutcome = {
      actualQualityIndex,
      actualParameters,
      predictionAccuracy: accuracy,
      actionsTaken: actionsTaken || [],
      actionsEffective: actionsEffective || false
    };
    
    prediction.status = 'Resolved';
    
    await prediction.save();
    
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get prediction statistics
exports.getPredictionStats = async (req, res) => {
  try {
    const total = await Prediction.countDocuments();
    const active = await Prediction.countDocuments({ status: 'Active' });
    const resolved = await Prediction.countDocuments({ status: 'Resolved' });
    const critical = await Prediction.countDocuments({ riskLevel: 'Critical' });
    const high = await Prediction.countDocuments({ riskLevel: 'High' });
    
    // Calculate average accuracy
    const resolvedPredictions = await Prediction.find({ 
      status: 'Resolved',
      'actualOutcome.predictionAccuracy': { $exists: true }
    });
    const avgAccuracy = resolvedPredictions.length > 0
      ? resolvedPredictions.reduce((sum, p) => sum + (p.actualOutcome.predictionAccuracy || 0), 0) / resolvedPredictions.length
      : 0;
    
    res.json({
      total,
      active,
      resolved,
      critical,
      high,
      averageAccuracy: Math.round(avgAccuracy * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

